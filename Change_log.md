# Change Log

## 2026-09-16 · Hero 二次纠错完成（J，仅本地）

- 下方“采用E”记录过早：用户再次指出镜框错误；E/F/G及H整图均未通过，不发布。
- 改用面部特写校正开口下半框，再向外扩展书桌与补足头顶，最终本地采用J。上缘没有闭合线，键盘/平板/笔杆/植物无涂色灰面。
- 累计11次成功出图，另1次额度失败；如实保留超预期迭代记录和I/J提示词。当前导出44994/137542字节。
- 已放大核对眼镜，1440/390浅深四种Hero检查与实际看图通过；证据在docs/evidence/hero-lineart-j/。
- 仅提交本轮素材和文档，不推送当前分支，避免将其他任务的本地增强同时部署。线上D及coursework-baseline标签不变。

## 2026-09-16 · E04 复制与快捷菜单

- 新增 `js/context-menu.js`：按 §15.1 仅在 `(hover: hover) and (pointer: fine)` 下启用；构建单层菜单（导航／页面动作／复制与只读状态三组，共 7 项，含内联 SVG 图标与中文文字），按 `clientX/clientY` 定位并夹到视口内 8px；点击外部、Esc、滚动、Resize、失焦时关闭，菜单自身滚动不关闭；键盘遵循 WAI-ARIA 菜单按钮模式（↑↓ 循环、Home/End、Enter/Space、Esc 归还焦点、Tab 关闭不困住焦点）；`input`／链接／媒体／选区／Shift／`[data-menu-exempt]` 保留原生菜单。
- 复制按 §15.6：优先 Clipboard API，失败或不可用时显示手动复制面板（只读地址 + 关闭按钮，聚焦并全选，Esc 与关闭按钮退出后焦点回到菜单按钮）；`file://` 下不复制本地路径，提示「请在公开网站中复制可分享链接」。
- `js/site.js` 新增共享动作 `notify`／`hideNotice`（统一状态区，3s 自动收起）、`copyText`、`siteUrl`／`publicUrl`、`focusSearch`、`goTop`；`js/reading.js` 暴露 `requestTop`，菜单的「返回顶部」与主题、搜索、进度全部复用既有实现，不写第二套。
- 七页写入 `#copy-panel` 静态降级标记并在 `reading.js` 之后以 `defer` 接入 `context-menu.js`；`css/components.css` 第 8 节补面板字段/输入框/说明样式（复用 `.field__*` 规格），菜单项加 `user-select: none`。既有 ID、类名、路径与无脚本降级不变。
- 新增可复验检查 `docs/evidence/e04/menu-checks.mjs`：Edge 153／Chrome 152／Firefox 155 各 **19 项通过、0 失败**，39 张截图；同视口 A/B（隐藏／显示按钮）在 1440 与 390 两档差异均为 0，证明按钮与菜单容器不改变页面布局。
- 回归：`node scripts/check-baseline.mjs` 158 项通过、0 失败（`#quick-menu-button` 的可见性断言改为与 `(hover:hover) and (pointer:fine)` 能力一致）；`docs/evidence/e03/reading-checks.mjs` 按新契约最小更新后三浏览器各 18 项通过。
- 本地提交，未推送、未部署；VC2 与线上增强版仍属 E06。

## 2026-09-16 · E03 简单阅读增强（返回顶部与阅读进度）

- 新增 `js/reading.js`：按 §16.3 计算页面滚动进度（贴顶 2px 墨线，`aria-valuenow` 同步，不设 `aria-live`），按 §16.2 在滚动 480px 后显示「返回顶部」，点击或键盘执行后先回到顶部再聚焦主标题；`prefers-reduced-motion` 下即时滚动。通过 `Sywen.getReadingProgress()` 暴露当前值，供后续菜单复用。
- 七页统一在 `site.js`（Blog 在 `blog.js`）之后以 `defer` 加载；控件仍带 `hidden`，初始化成功才揭示，失败与禁用脚本时页面保持原基线。
- 页脚按 §16.2 预留浮动按钮空间（`html.has-reading` + `--footer-reserve`），实测两档视口下按钮与页脚内容矩形零相交；共享样式只新增状态类，未改既有类名。
- 新增可复验检查 `docs/evidence/e03/reading-checks.mjs`（含自写 PNG 解码对照）：Edge 153／Chrome 152／Firefox 155 各 18 项、0 失败；与 B05 基线同视口逐像素对照，忽略顶部进度线后差异为 0。
- 基线回归 `node scripts/check-baseline.mjs` 收紧后 158 项通过、0 失败；`shot()` 增加一次重试以规避本机偶发截图写入失败（不改变截图参数与断言）。
- 本地提交，未推送、未部署；VC2 与线上增强版仍属 E06。

## 2026-09-16 · Hero 下半框眼镜与线稿纠正

- 按用户反馈重新实际核对三视图：明确红色下半框、上缘无红框；纠正旧提示词过宽和验收遗漏。
- 内置出图新增一次定向修订 E，去除电脑/键盘/平板/笔杆/植物的涂色灰面，以线条和留白表现；保留低头书写构图。
- 更新正式640/1280 WebP（40260/126590字节）、资源哈希、规范与提示词；旧D和旧验收截图保留为历史。
- 本次仅做Hero四种桌面/手机浅深的定向复核，不重复全站功能测试；基线标签不移动，E类任务仍延期。

## 2026-09-16 · B06 作业基线交付

- 用户确认正式地址 https://sywen-blog.pages.dev/；655e8c4部署版本的线上文件/路径25项及三浏览器核心15项全部通过。
- 归档实际线上演示录像；更新README、交付说明、B/E索引、验收和当前交接。B00–B06 Passed，可停止提交；E01–E06仍Deferred。
- Gitee保留计划/内容/视觉/交互/验收等连续提交，基线标签coursework-baseline用于回退。后续文档版本与已验收运行时一致。

## 2026-09-16 · B05 本地验收完成

- 归档 158 项通过的检查报告、23 张当前截图与可复验脚本；VC0 修订和 VC1-B 已实际查看图片。
- Edge/Chrome/Firefox 核心交互通过，320–1440px（含两处断点邻值）、浅深、异常降级、子目录、键盘与减少动态覆盖。
- 全尺寸运行时源码对应 e3191ba；报告保留运行时父提交与后补源码哈希说明。Firefox 初次在系统加密目录启动失败，改装在工作区的忽略目录后通过，不改浏览器或产品代码。
- 明确真实手机和浏览器 UI 缩放未执行；完成等效 200% 布局检查。线上验收留 B06。

## 2026-09-16 · B06 发布路径修正

- 实测 Cloudflare 对缺失路径返回首页和 200；发布脚本生成最小 404 响应以关闭默认 SPA 回落，不实施 Backlog 的插画 404。
- 部署说明登记用户确认的正式网址，以及 version.json 源版本对应方式。

## 2026-09-16 · B04 核心交互与 Hero 场景修订

- 完成主题持久化、标题/摘要/标签多词 AND 搜索与分类组合；保留中文输入、URL 状态、数量/无结果/重置、存储失败和初始化失败降级。
- 按用户习惯将 Hero 改为笔记本电脑、平板与手写笔；两次定向修订后采用 D，人物低头看向平板。四次出图总量内完成，未开启 E 类素材。
- Home/About 作者简介明确计算机专业身份，更新提示词、资源哈希、视觉规范与 VC0 记录。
- 本地 Edge/Chrome/Firefox 核心检查及 7 页双主题 9 尺寸矩阵等共 158 项通过；完整证据由 B05 单独归档。
- 正式地址由用户确认为 https://sywen-blog.pages.dev/；Cloudflare 构建新增 version.json 记录源提交，待 B06 核验。

## 2026-09-15 · 部署配置：Cloudflare Pages 自动部署

- 新增 `scripts/build-site.sh`：清理并重建 `dist/`，按白名单复制三个顶层页面与 `css/`、`js/`、`posts/`、`assets/`；`index.html` 缺失即失败，可选目录缺失只记录不失败。
- 新增 `.gitattributes`（`*.sh` 固定 LF）与 `docs/deployment.md`（发布链路、Dashboard 参数、日常发布流程）；`.gitignore` 补充 `.tmp*` 忽略本地临时脚本。
- `dist/` 保持不提交，由构建过程生成；开发文档、参考素材与证据不进入发布产物。
- 验证：本地 `bash scripts/build-site.sh` 通过；发布产物引用闭合检查 0 缺失（大小写精确）；7 个页面与全部静态资源 HTTP 200，未收录的开发文档返回 404；未发现密钥、本地绝对路径或 `file://` 引用。


## 2026-09-15 · B02/B03 主视觉与静态融合

- 内置出图两候选，采用书桌Hero B；保存提示词、资源哈希与VC0截图，母版不上线。
- 完成品牌、Hero、栏目编号、分类、About连续文本与正文样式；640/1280 WebP为43KB/145KB。
- 验证：1440/390浅深目视通过；6个初步页面场景无横向溢出。
- B00最小HTTPS首页和文章深链接已200，正式内容发布留B06。


## 2026-09-15 · B01 七页内容完成

- 补齐四篇示例正文、元数据、标签和相邻导航；静态索引与数据一致。
- 新增原创SVG搜索流程示意；About介绍改成连续文本块。
- 验证：七页唯一h1和内部文件链接通过；浏览器验证留B05。


## 2026-09-15 · B00 作业基线与任务目录

- 落地 B00–B06 / E01–E06 / Backlog；明确 Gitee 与公开 HTTPS 均为作业完成要求。
- 更新 Plan、DESIGN_SPEC v1.1、29章规划相关章节与新增DOM契约；增强默认Deferred。
- 核对：工作区起始干净，Gitee/GitHub main均为59ce56f；无Netlify环境凭据，托管继续核对，不将远端读取当作发布通过。


按时间倒序记录项目变更：日期、变更摘要与验证结果。功能与验收依据见 [PROJECT_PLAN.html](PROJECT_PLAN.html)、[DESIGN_SPEC.md](DESIGN_SPEC.md) 与 [Plan.md](Plan.md)。

## 2026-09-15 · T04 修订：网点装饰修正（像素复验发现）

- 像素级复验（直接测量截图）发现 `hero-art__dots` 的网点**完全不可见**：`radial-gradient(ink .5px, transparent .5px)` 在 8px 瓦片内不覆盖任何像素中心（0 个非纸色像素）。
- 修正为「同色 `radial-gradient` 背景 ＋ 8×8 SVG mask（圆心 (4,4)、r=0.5）＋ 显式 `mask-size: var(--dot-gap)`」，颜色由 `background-color: var(--color-ink)` 经 mask 着色，网点因此跟随主题变量。`css/components.css` 的 `.hero-art__dots` 内已注明两条必须同时成立的约束，避免退回已知失效写法。
- 复测（Edge 153 headless + CDP 重新截图后逐像素测量）：8px 间隔、每 64×64 片 64 点、共 6.25% 覆盖；浅色网点 `rgb(242,238,229)`、深色 `rgb(37,38,39)`，均与 `#F2EEE5` 以 `--dot-opacity` 0.08 与纸色的混色结果逐字节相符。
- 同步重拍全部 12 张两主题截图与 3 张禁用 JavaScript 截图（`docs/evidence/t04/`），并重跑静态审计与渲染检查（24 个场景 + 12 个边界场景全部 PASS，异常计数 0）。
- 已知容差（非阻塞，留 VC1）：`--dot-size` 声明 1px，实测渲染为 2×2 设备像素；1×1 的 mask 会被缩放到整块瓦片、2×2 瓦片会渲染成 4×4 色块，故保留当前几何。新增像素复验记录与测量脚本 `docs/evidence/t04/pixel-verification.md`、`dots-pixel-check.mjs`。

## 2026-09-15 · Stage 2 视觉基础（T04 Tokens、公共组件与响应式）

- 新增 `css/base.css`（Token 注册表、浅深主题与系统跟随、移动优先响应式 Token、重置与排版、焦点、跳转链接、辅助技术工具类、减少动态效果）、`css/components.css`（增强控件、刊头与导航、按钮族与表单控件、分类／标签／结果工具、文章条目、旁白面板、角色图框与装饰、状态块、菜单项、正文骨架）、`css/pages.css`（容器与外壳、Home／Blog／Post／About 布局骨架）。
- 七页加入三个样式表与 favicon 引用及 `<noscript>` 隐藏脚本控件；Home 加入角色图框（跨角胶带＋1px 网点＋旁白「学习中，持续更新。」），About 加入同一角色图（规范替代文本、仅胶带），Blog 空状态加入方形头像。
- 主题契约冻结为根元素 `data-theme="light|dark"`；未设置时由 `:root:not([data-theme])` 跟随系统。本轮不加入头部内联主题脚本，留给 T11 的 `theme.js`，避免形成第二套主题写入逻辑。
- 验证：静态审计 14 项 PASS（无悬空 `var()`、80 项 Token 取值与 §4／§5／§16 一致、断点仅 768／1024px）；Edge 153 headless + CDP 渲染检查 24 个页面×视口场景与 12 个断点边界场景全部 PASS，横向溢出、资源错误、脚本与控制台错误、隐藏项异常均为 0；实测对比度浅色 14.02／5.75／12.35／15.15、深色 12.02／7.91／7.96／10.78；首页本地资源 76,746 字节（74.9KB，目标 ≤500KB）；禁用 JavaScript 三页截图样式、导航、静态索引与图片可用。
- 首次渲染检查发现并以像素证据修复 7 项偏差：容器内容列 1056px→1120px、About 桌面两列错位、About 角色图 360px→300px（`--about-art-height` 此前未被引用）、Tablet 档角色图 220px→300px、Post 头部＋正文 804px→740px、网点直径 2px→1px、胶带由框外改为跨角。
- 证据保存于 `docs/evidence/t04/`（审计与渲染脚本、`render-checks.json`、`render-report.txt`、17 张截图）；同步验收、交接、README 与 AGENTS 当前事实。T04 Passed，Stage 2 任务集（T02＋T04）完成；T03 公开 HTTPS 仍未验证。

## 2026-09-15 · T00／T01 复验与 T02 指定视觉资产派生

- T00／T01 复验通过：五张原图哈希不变、忽略规则有效、基线与远端可追溯；七页 HTTP 内容一致，元数据唯一、公共 Header/Footer 一致，Edge 禁用 JavaScript 后导航、跳到正文焦点和隐藏控件均通过。
- 新增两张原图确定性裁切 WebP（Pillow 10.4.0 / libwebp 1.3.2，quality=90、method=6）：上身图 320×600、28,910 字节；头像 225×225、8,900 字节。保持规范坐标，无重绘或缩放。
- 新增 24×24、2px 描边 S 标识 favicon（315 字节）；16／32px 实际渲染检查通过。角色原图／派生图并排核对通过，浏览器解码及资产 HTTP 检查通过。
- 验收证据保存于 `docs/evidence/t02/`；同步验收、交接、README、计划状态和 AGENTS 当前事实。旧会话图片能力限制仅保留为历史记录。
- T02 Passed，T04 Ready。T03 公开 HTTPS 仍未验证；Stage 1／Stage 2 不标记全部完成。页面资源接入保留给 T04。

## 2026-09-15 · Stage 1 七页语义骨架与路径契约（T01）

- 新增七个页面：`index.html`（Hero、最近三篇文章、四类入口及数量、最近在做）、`blog.html`（标题说明、筛选工具、动态结果容器、无结果状态、四篇静态索引）、`about.html`（关于我、学习方向、兴趣、最近在做、三组静态问答）与 `posts/` 下四篇文章页。
- 建立公共 Header／Footer、跳转链接、`data-site-root`／`data-page`／`data-post` 站点根与页面标识，以及七个默认 `hidden` 的增强控件挂载位置（主题、快捷菜单、阅读进度、返回顶部、状态提示、复制面板、右键菜单）。
- 冻结路径、ID、`data-*` 与类名契约，记入 `docs/agent-handoffs.md`，供 T02～T14 沿用。
- 页面不引用任何 CSS、JS、图片与 favicon，因此禁用 JavaScript 时导航、静态索引与正文开篇段完全可用，且不产生资源 404。
- 验证：结构检查通过（七页各 1 个 `h1`、标题与描述唯一、跳转链接有效、控件默认隐藏、无脚本依赖）；链接解析无死链、无未知分类、文章页统一 `../`；本地 HTTP 七页均 200 且响应字节与工作区文件 SHA256 一致；Header／Footer 七页一致。
- 首轮检查发现文章页缺少当前分区标记，已补 `aria-current="true"` 后复检通过。
- 推送：`git -c http.sslBackend=openssl push origin main` 成功（`8747276..8a42ddb`），随后的文档记录提交同样推送成功。
- 未验证：T03 最小部署按用户决定延期（外部阻塞），无公开地址。

## 2026-09-15 · Stage 0 执行基线与工程准备（T00）

- 新增执行记录：`docs/agent-handoffs.md`（任务状态、DOM 与路径契约、未验证项）、`docs/acceptance.md`（阶段验收、外部阻塞、已知问题）、`docs/visual-review.md`（VC1／VC2 检查点容器）。
- `README.md` 更新为当前真实状态：阶段进度、实际目录、本地 HTTP 预览方式、执行记录入口、仓库与推送说明。
- `AGENTS.md` 修正过时事实：参考素材由“四张”更正为五张；删除“应用目录尚不存在”与“无 Git 历史”的旧描述；补充 `docs/` 记录说明与“增强控件默认 `hidden`、由脚本显示”的约定。
- `.gitignore` 新增发布目录／打包产物（`/release/`、`/dist/`、`*.zip`）与编辑器缓存排除项。
- 验证：五张参考 PNG 的 SHA256 与基线一致（未改动）；`git -c http.sslBackend=openssl ls-remote origin` 返回 `refs/heads/main`；新增文件与跟踪文件中未发现凭据；`docs/` 与 `参考素材/` 未被忽略规则误伤。
- 未验证：Netlify 账号与公开 HTTPS 条件（外部阻塞，见 `docs/acceptance.md` OB-02）。Git 推送认证当时未验证（OB-01），已于同日关闭。
