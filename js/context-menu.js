(function () {
  'use strict';

  // 自定义右键菜单与「快捷菜单」按钮（PROJECT_PLAN §15、§16.4、§20.2）。
  // 本模块只做条件拦截、菜单 DOM、定位、关闭与键盘；所有动作调用 window.Sywen 的共享实现，
  // 不复制主题、搜索、阅读进度或返回顶部的第二套逻辑。
  const site = window.Sywen = window.Sywen || {};
  const root = document.documentElement;

  const CAPABILITY = '(hover: hover) and (pointer: fine)';  // §15.1 桌面增强条件
  const EDGE_GAP = 8;                                       // §15.3／§15.4 视口四周保留
  const LABEL_ID = 'context-menu-label';
  let labelSeq = 0;

  let menu = null;
  let button = null;
  let panel = null;
  let input = null;
  let panelClose = null;
  let items = null;
  let returnFocus = null;
  let panelReturnFocus = null;
  let capability = null;
  let listening = false;
  let open = false;

  // ---------------------------------------------------------------------------
  // 菜单内容（§15.2）：导航 1 组、页面动作 1 组、复制与只读状态 1 组。
  // ---------------------------------------------------------------------------

  const ICONS = {
    home: '<path d="M3 8.5 8 4l5 4.5V13H3z"/><path d="M6.5 13V9.5h3V13"/>',
    blog: '<path d="M4 3.5h8v9H4z"/><path d="M6 6.5h4M6 9h4"/>',
    back: '<path d="M12.5 8H4"/><path d="M7.5 4.5 4 8l3.5 3.5"/>',
    about: '<circle cx="8" cy="6" r="2.5"/><path d="M3.5 13c.6-2.2 2.3-3.3 4.5-3.3s3.9 1.1 4.5 3.3"/>',
    search: '<circle cx="7" cy="7" r="4"/><path d="M10 10l2.5 2.5"/>',
    top: '<path d="M8 13V4"/><path d="M4.5 7.5 8 4l3.5 3.5"/>',
    theme: '<circle cx="8" cy="8" r="5"/><path d="M8 3a5 5 0 1 0 0 10z" fill="currentColor" stroke="none"/>',
    pageLink: '<path d="M6.8 9.2a2.5 2.5 0 0 0 3.5 0l1.5-1.5"/><path d="M9.2 6.8a2.5 2.5 0 0 0-3.5 0L4.2 8.3"/><path d="M5 12h6M5 4h6"/>',
    postLink: '<path d="M6.5 3.5h4l2 2V13h-6z"/><path d="M6.5 7.5h4M6.5 10h4"/>',
  };

  function icon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.innerHTML = ICONS[name] || '';
    return svg;
  }

  // 分组用细分割线（§15.3）；组名用 sr-only 文本并以 aria-labelledby 标注，不留视觉噪音。
  function group(label) {
    const box = document.createElement('div');
    box.className = 'context-menu__group';
    box.setAttribute('role', 'group');
    const id = LABEL_ID + '-' + (++labelSeq);
    const caption = document.createElement('span');
    caption.className = 'sr-only';
    caption.id = id;
    caption.textContent = label;
    box.setAttribute('aria-labelledby', id);
    box.append(caption);
    return box;
  }

  function item(label, iconName, action) {
    const node = document.createElement('button');
    node.type = 'button';
    node.className = 'context-menu__item';
    node.setAttribute('role', 'menuitem');
    // 菜单项不进入 Tab 顺序：菜单内用方向键移动，Tab 关闭菜单交给浏览器（§15.5）。
    node.tabIndex = -1;
    const text = document.createElement('span');
    text.textContent = label;
    node.append(icon(iconName), text);
    // 先执行动作再关闭：动作可能读取菜单打开状态（如只读进度），且关闭会撤销焦点。
    node.addEventListener('click', () => { action(); closeMenu(false); });
    return node;
  }

  function buildMenu() {
    const post = Boolean(root.dataset.post);
    const nav = group('导航');
    nav.append(
      item('首页', 'home', () => { location.href = site.resolveUrl('index.html'); }),
      // §15.2：文章页同一入口文案改为「返回文章列表」，不重复设置两个文章列表入口。
      post
        ? item('返回文章列表', 'back', () => { location.href = site.resolveUrl('blog.html'); })
        : item('文章', 'blog', () => { location.href = site.resolveUrl('blog.html'); }),
      item('关于', 'about', () => { location.href = site.resolveUrl('about.html'); })
    );

    const actions = group('页面动作');
    const themeItem = item('切换至深色', 'theme', () => { if (site.toggleTheme) site.toggleTheme(); });
    actions.append(
      // §15.5：执行「搜索」后以目标位置为最终焦点（列表页搜索框／blog.html?focus=search）。
      item('搜索文章', 'search', () => { if (site.focusSearch) site.focusSearch(); }),
      // §15.2：滚动顶部并聚焦主标题，复用 reading.js 的唯一实现。
      item('返回顶部', 'top', () => { if (site.goTop) site.goTop(); }),
      themeItem
    );

    const links = group('复制与状态');
    links.append(item(post ? '复制文章链接' : '复制页面链接', post ? 'postLink' : 'pageLink', copy));

    let progress = null;
    if (post) {
      // §15.2：只读状态，不进入菜单项键盘循环，不伪装成可执行命令。
      progress = document.createElement('p');
      progress.className = 'context-menu__progress';
      progress.setAttribute('role', 'status');
      progress.setAttribute('aria-live', 'off');
      links.append(progress);
    }

    for (const box of [nav, actions, links]) menu.append(box);
    return { all: Array.from(menu.querySelectorAll('[role="menuitem"]')), theme: themeItem, progress, themeText: themeItem.querySelector('span') };
  }

  // ---------------------------------------------------------------------------
  // 打开、定位与关闭（§15.3、§15.4）
  // ---------------------------------------------------------------------------

  function clamp(value, min, max) {
    if (!(max > min)) return min;
    return Math.max(min, Math.min(max, value));
  }

  function place(x, y) {
    const box = menu.getBoundingClientRect();
    // §15.4：测量实际菜单尺寸后限制到视口内，四周保留 8px；高度不足时由 CSS 内部滚动承接。
    const left = clamp(x, EDGE_GAP, Math.max(EDGE_GAP, window.innerWidth - EDGE_GAP - box.width));
    const top = clamp(y, EDGE_GAP, Math.max(EDGE_GAP, window.innerHeight - EDGE_GAP - box.height));
    menu.style.left = Math.round(left) + 'px';
    menu.style.top = Math.round(top) + 'px';
  }

  function syncMenuState() {
    if (!items) return;
    if (items.themeText && typeof site.getTheme === 'function') {
      // §16.1：调用同一份主题逻辑，文案同步更新。
      items.themeText.textContent = site.getTheme() === 'dark' ? '切换至浅色' : '切换至深色';
    }
    if (items.progress) {
      const value = currentProgress();
      items.progress.textContent = '阅读进度：' + (value === null ? '—' : value + '%');
    }
  }

  // reading.js 的进度值按 requestAnimationFrame 合并更新，滚动事件里可能仍读到上一帧的值；
  // 只读状态区直接按同一公式测量当前位置，保证与滚动位置一致（不维护第二套滚动监听）。
  // reading.js 尚未初始化时返回 null，由调用方显示占位符。
  function currentProgress() {
    if (typeof site.getReadingProgress === 'function' && site.getReadingProgress() === null) return null;
    const scroller = document.scrollingElement || document.documentElement;
    if (!scroller) return null;
    const max = scroller.scrollHeight - scroller.clientHeight;
    if (!(max > 0)) return 100;
    return Math.max(0, Math.min(100, Math.round((scroller.scrollTop / max) * 100)));
  }

  const shown = () => Boolean(menu) && !menu.hidden;
  // 可作为焦点目标：仍挂载在文档中且没有 inert 祖先（菜单项会随菜单一起 inert）。
  const focusableTarget = (node) => Boolean(node) && node.isConnected && typeof node.focus === 'function'
    && !node.closest('[inert]');

  function openMenu(options) {
    if (!menu || !items) return;
    const pointer = options && options.pointer ? options.pointer : null;
    const fromButton = Boolean(options && options.fromButton);
    // §15.5：Esc 关闭后要把焦点恢复到这里；按钮入口即按钮自身。
    returnFocus = fromButton ? button
      : (focusableTarget(document.activeElement) ? document.activeElement : button);
    if (menu.hidden) {
      menu.hidden = false;
      menu.removeAttribute('inert');
    }
    open = true;
    syncMenuState();
    if (pointer) {
      place(pointer.x, pointer.y);           // §15.4：按鼠标 clientX/clientY 定位
    } else if (button) {
      const box = button.getBoundingClientRect();
      place(box.left, box.bottom + 4);       // §15.5：按钮入口锚定按钮
    }
    if (button) button.setAttribute('aria-expanded', 'true');
    // 鼠标按下按钮打开时，焦点留在按钮上（松开后仍可继续点击／不使用鼠标时按 Enter 收起）；
    // 键盘打开与右键打开则把焦点交给第一个可执行项（§15.5）。
    if (!options || options.focusMenu !== false) {
      const first = items.all.length ? items.all[0] : menu;
      try { first.focus({ preventScroll: true }); } catch (_) { first.focus(); }
    }
  }

  function closeMenu(restore) {
    if (!open) return;
    open = false;
    if (menu) {
      menu.hidden = true;
      menu.setAttribute('inert', '');      // 隐藏时不可点击、不可聚焦（§15.4）
      menu.removeAttribute('style');
    }
    if (button) button.setAttribute('aria-expanded', 'false');
    const target = returnFocus;
    returnFocus = null;
    if (restore === false) return;
    restoreFocus(target);
  }

  // 焦点归还放到当前事件之后：在 focus 处理过程中同步隐藏菜单／面板（display:none）会被浏览器
  // 的焦点修正（focus fixup）覆盖，实测最终落回 body。因此隐藏后在随后的任务里补设一次，
  // 一旦焦点已落到别处（用户主动移动）就不再抢夺。
  function restoreFocus(target) {
    if (!focusableTarget(target)) return;
    const apply = () => {
      if (!focusableTarget(target)) return false;
      try { target.focus({ preventScroll: true }); } catch (_) { try { target.focus(); } catch (_) { /* 元素不可聚焦时保持现状 */ } }
      return document.activeElement === target;
    };
    const given = () => {
      const active = document.activeElement;
      return Boolean(active) && active !== target && active !== document.body && !target.contains(active);
    };
    if (typeof queueMicrotask === 'function') queueMicrotask(apply);
    else apply();
    // 隐藏面板/菜单会让浏览器在随后的任务里做焦点修正，覆盖面到用户交互结束后的一小段时间。
    for (const delay of [0, 16, 60, 200]) {
      window.setTimeout(() => {
        if (given() || !focusableTarget(target)) return;
        apply();
      }, delay);
    }
  }

  // §15.4 的关闭时机统一由下面几个监听处理；监听在初始化时一次性注册，处理器内部判断
  // 菜单是否打开，避免「菜单已打开时再次 openMenu」导致监听被重复注册或丢失。
  function onResize() { if (shown()) closeMenu(false); }
  function onWindowBlur() { if (shown()) closeMenu(false); }
  function onWindowScroll(event) {
    if (!shown()) return;
    // §15.4：菜单自身滚动不触发关闭。
    if (menu && event && event.target && menu.contains(event.target)) return;
    closeMenu(false);
  }
  function onFocusIn(event) {
    if (!shown()) return;
    // 焦点移到菜单与按钮之外时关闭；点击外部不把焦点强拉回（§15.5）。
    if (!menu || menu.contains(event.target) || event.target === button) return;
    closeMenu(false);
  }
  function onPointerDown(event) {
    if (!shown()) return;
    // 菜单内部不关闭；点在按钮上交给按钮自身的 pointerdown 处理开合。
    if (menu && menu.contains(event.target)) return;
    if (event.target === button) return;
    closeMenu(false);
  }

  // ---------------------------------------------------------------------------
  // 键盘（§15.5，WAI-ARIA 菜单按钮模式）
  // ---------------------------------------------------------------------------

  function focusItem(index) {
    if (!items || !items.all.length) return;
    const count = items.all.length;
    items.all[((index % count) + count) % count].focus();
  }

  function onKeydown(event) {
    const escape = event.key === 'Escape';
    if (escape) {
      if (shown()) {
        event.preventDefault();
        closeMenu(true);
        return;
      }
      if (panel && !panel.hidden) {
        event.preventDefault();
        hidePanel();
        return;
      }
    }
    if (!shown() || !items) return;
    const all = items.all;
    const current = all.indexOf(document.activeElement);
    switch (event.key) {
      case 'Tab':
        // §15.5：只关闭菜单，不 preventDefault；浏览器从该菜单项在文档中的位置继续，
        // 移动到下一个／上一个正常可聚焦元素，不困住焦点。
        closeMenu(false);
        return;
      case 'ArrowDown':
        event.preventDefault();
        focusItem(current < 0 ? 0 : current + 1);
        return;
      case 'ArrowUp':
        event.preventDefault();
        focusItem(current < 0 ? all.length - 1 : current - 1);
        return;
      case 'Home':
        event.preventDefault();
        focusItem(0);
        return;
      case 'End':
        event.preventDefault();
        focusItem(all.length - 1);
        return;
      default:
        return;
    }
  }

  // ---------------------------------------------------------------------------
  // 复制与降级面板（§15.6）
  // ---------------------------------------------------------------------------

  function currentUrl() {
    // §15.2：文章页复制不含查询和片段的文章地址，其他页复制当前完整地址。
    return root.dataset.post ? site.publicUrl() : site.siteUrl();
  }

  function showPanel(url, trigger) {
    if (!panel || !input) return false;
    // 归还焦点要选「关闭面板后仍然可聚焦」的元素：菜单项会随菜单一起 inert，因此
    // 菜单项优先归还给菜单按钮；只有来自页面其他控件的触发才用触发元素本身。
    const active = document.activeElement;
    panelReturnFocus = (focusableTarget(trigger) && trigger !== button ? trigger : null)
      || (focusableTarget(active) && active !== button ? active : null)
      || (focusableTarget(button) ? button : null);
    input.value = url;
    site.hideNotice();
    panel.hidden = false;
    try { input.focus({ preventScroll: true }); } catch (_) { input.focus(); }
    // §15.6：聚焦并选中地址，提示手动复制。
    try { input.select(); } catch (_) { /* 选区不可用时仍保留只读地址 */ }
    return true;
  }

  // §15.6：Esc 或关闭按钮退出后恢复焦点（与菜单同样的延后处理）。
  // 键盘路径下浏览器会在 keydown 处理结束后再做一次焦点修正，覆盖同步设置的结果，
  // 因此把归还动作排到当前任务之后，并交给 restoreFocus 反复确认。
  function hidePanel(options) {
    if (!panel || panel.hidden) return;
    const restore = !options || options.restore !== false;
    // 「关闭」按钮随面板一起隐藏后无法再聚焦，因此点它关闭时焦点回到菜单按钮；
    // Esc 退出则回到打开面板前的元素（§15.6 的键盘闭环）。
    const target = restore ? panelReturnFocus : button;
    panelReturnFocus = null;
    // 先把焦点移出面板再隐藏：面板仍持有焦点时被隐藏，浏览器会把焦点丢回 body，
    // 之后的 focus() 调用会被这次焦点修正吞掉（实测 focus() 无效）。
    const active = document.activeElement;
    if (active && panel.contains(active) && typeof active.blur === 'function') active.blur();
    if (target && target.isConnected && typeof target.focus === 'function') {
      try { target.focus({ preventScroll: true }); } catch (_) { try { target.focus(); } catch (_) { /* 保持现状 */ } }
    }
    panel.hidden = true;
    if (!target || target === panel) return;
    // 隐藏本身仍可能触发一次焦点修正，因此随后再确认一次（见 restoreFocus）。
    restoreFocus(target);
  }

  function copy() {
    const url = currentUrl();
    const trigger = document.activeElement !== document.body ? document.activeElement : button;
    // §15.6：file:// 模式不尝试复制本地磁盘路径，提示改用公开网站。
    if (location.protocol === 'file:') {
      // 面板会自行清理上一轮提示，因此先开面板再提示，文案不被覆盖。
      if (!showPanel(url, trigger)) site.notify('可分享地址：' + url, { duration: 6000 });
      site.notify('请在公开网站中复制可分享链接');
      return;
    }
    // §15.6：优先 Clipboard API，写入失败（Promise 拒绝）时给出带标签的手动复制面板。
    site.copyText(url).then((ok) => {
      if (ok) { site.notify('链接已复制'); return; }
      if (!showPanel(url, trigger)) site.notify('可分享地址：' + url, { duration: 6000 });
    });
  }

  // ---------------------------------------------------------------------------
  // 条件拦截（§15.1）
  // ---------------------------------------------------------------------------

  function hasTextSelection() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return false;
    return String(selection).trim() !== '';
  }

  // 检查目标元素及其祖先，不只检查直接点击的节点：任一祖先命中即保留原生菜单。
  function nativeMenu(element) {
    if (!element || typeof element.closest !== 'function') return true;
    if (element.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) return true;
    if (element.closest('a, img, video, audio')) return true;
    if (element.closest('#copy-panel')) return true;          // 降级面板的输入框保留原生菜单
    if (element.closest('[data-menu-exempt]')) return true;   // 后续菜单豁免区域的统一钩子
    return hasTextSelection();
  }

  function onContextMenu(event) {
    // §15.1：只有准备显示自定义菜单时才调用 preventDefault()，其余情况完全不干预。
    if (!capability || !capability.matches || event.shiftKey || event.defaultPrevented) return;
    const target = event.target && event.target.nodeType === 1 ? event.target : event.target.parentElement;
    if (nativeMenu(target)) return;
    event.preventDefault();
    openMenu({ pointer: { x: event.clientX, y: event.clientY } });
  }

  // ---------------------------------------------------------------------------
  // 初始化
  // ---------------------------------------------------------------------------

  function updateCapability() {
    const capable = Boolean(capability && capability.matches);
    if (listening && !capable) {
      // §15.1：媒体条件变化导致不再适用时，关闭菜单并撤销拦截。
      document.removeEventListener('contextmenu', onContextMenu, true);
      listening = false;
      closeMenu(false);
      hidePanel();
    }
    if (!listening && capable) {
      document.addEventListener('contextmenu', onContextMenu, true);
      listening = true;
    }
    if (button) button.hidden = !capable;
  }

  function trackCapability() {
    try {
      capability = window.matchMedia(CAPABILITY);
    } catch (_) {
      capability = null;
    }
    if (!capability) return;
    if (typeof capability.addEventListener === 'function') capability.addEventListener('change', updateCapability);
    else if (typeof capability.addListener === 'function') capability.addListener(updateCapability);
  }

  function init() {
    button = document.getElementById('quick-menu-button');
    menu = document.getElementById('context-menu');
    panel = document.getElementById('copy-panel');
    input = document.getElementById('copy-panel-input');
    panelClose = document.getElementById('copy-panel-close');
    if (!button || !menu) return;

    try {
      items = buildMenu();
    } catch (_) {
      items = null;
    }
    // 构建失败时不显示按钮，页面保持原基线（静态降级）。
    if (!items) return;

    menu.setAttribute('inert', '');
    menu.setAttribute('role', 'menu');
    if (!menu.hasAttribute('aria-label')) menu.setAttribute('aria-label', '页面快捷菜单');
    button.setAttribute('aria-haspopup', 'menu');
    button.setAttribute('aria-expanded', 'false');
    // 菜单按钮的点击处理（§15.5 菜单按钮语义）：
    // 用「谁按下的」决定行为，避免不同引擎 pointer/keyboard 事件顺序造成的重复开合。
    // - 指针交互：pointerdown 立即开合，随之而来的 click 被忽略（一次点击只处理一次）。
    // - 键盘交互：Enter／Space 合成的 click 走 K 分支，打开并把焦点交给第一个可执行项。
    let pointerToggle = false;      // 本次交互由指针按下处理
    let keyboardActivate = false;   // 本次交互由键盘触发
    let deferScheduled = false;
    let deferredActivate = false;
    const scheduleDeferred = () => {
      if (deferScheduled) return;
      deferScheduled = true;
      window.setTimeout(() => {
        deferScheduled = false;
        if (deferredActivate) {
          deferredActivate = false;
          if (!shown()) openMenu({ fromButton: true, focusMenu: true });
          return;
        }
        pointerToggle = false;
      }, 0);
    };
    button.addEventListener('pointerdown', () => {
      if (pointerToggle) return;      // 同一次指针交互只处理一次
      pointerToggle = true;
      scheduleDeferred();
      if (shown()) closeMenu(true);
      else openMenu({ fromButton: true, focusMenu: false });
    });
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && shown()) {
        event.preventDefault();
        closeMenu(true);
        return;
      }
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') keyboardActivate = true;
    });
    button.addEventListener('click', () => {
      const fromPointer = pointerToggle;
      const fromKeyboard = keyboardActivate;
      pointerToggle = false;
      keyboardActivate = false;
      if (fromPointer) return;        // 指针路径已在 pointerdown 处理
      if (fromKeyboard) {
        // 键盘激活（Enter／Space 合成的 click）：菜单开着时这一下就是收起，不再延迟展开；
        // 只有从收起状态打开时才需要延迟一拍，避免同一次回车被处理两次。
        if (shown()) {
          deferredActivate = false;
          closeMenu(true);
          return;
        }
        deferredActivate = true;
        scheduleDeferred();
        openMenu({ fromButton: true, focusMenu: true });
        return;
      }
      if (shown()) closeMenu(true);
      else openMenu({ fromButton: true });
    });
    if (panelClose) {
      // 面板处于模态焦点语境：按下「关闭」时先把焦点交给该按钮，再由它关闭面板，
      // 这样关闭后焦点留在按钮上（§15.6）。
      panelClose.addEventListener('mousedown', (event) => {
        event.preventDefault();
        try { panelClose.focus({ preventScroll: true }); } catch (_) { /* 保持现状 */ }
      });
      panelClose.addEventListener('click', () => hidePanel({ restore: false }));
    }
    // Esc 关闭：document 级兜底 + 菜单自身监听（焦点在菜单项时也稳定收到）。
    document.addEventListener('keydown', onKeydown);
    menu.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && shown()) {
        event.preventDefault();
        closeMenu(true);
      }
    });
    // 关闭时机监听（§15.4）：一次性注册，处理器内部按菜单状态判断。
    // scroll 用捕获阶段，元素级滚动（含非冒泡的 scroll 事件）也能收到。
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onWindowScroll, true);
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('focusin', onFocusIn);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeydown);
    trackCapability();
    updateCapability();
    // 菜单打开期间只读进度与页面保持一致（复用同一数值，不重算）。
    window.addEventListener('scroll', () => { if (shown()) syncMenuState(); }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
