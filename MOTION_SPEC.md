# Motion & Gradient System

状态：Phase 1 实施中（2026-09-18）

## 1. 定位

Sywen's Space 的动效是 **Quiet Motion**：静止时像一本安静的漫画速写本，交互时只让纸张、墨线、贴纸和分镜获得轻微生命感。动效服务于层级、反馈和阅读节奏，不承担内容，也不修补静态设计。

视觉基线保持不变：冷白素描纸、静态 paper grain、黑灰墨线、少量低饱和 accent、manga line-art、editorial research sketchbook。

## 2. Motion principles

1. Motion follows hierarchy：内容越重要，反馈可以越清楚；装饰越靠后，运动越弱。
2. Feedback before flourish：交互反馈必须先告诉用户状态，再考虑气质。
3. Paper stays still：纸纹、lighting、背景定位和背景材质完全静态。
4. Content remains complete：无 JS、脚本失败或关闭动画时，Content Layer 仍完整可读可操作。
5. One gesture per element：一个元素一次只表达一种运动，不叠加缩放、弹跳、发光和大位移。
6. Reading is quiet：Article 正文、代码、表格、引用和连续阅读区不做持续运动。

## 3. Motion hierarchy

### Level 1 — Interaction Feedback

适用于导航、链接、按钮、分类入口、文章条目和可点击纸面。目标是确认“这里可以交互”。

- 时长：140–240ms。
- 属性：优先 `transform`、`opacity`、颜色、边框和下划线。
- 幅度：位移 1–3px；箭头 2–4px。
- 允许：墨线加强、手绘下划线展开、纸片边缘轻微错位、硬阴影随按下收紧。
- 禁止：普遍 `scale(1.05)`、大幅 zoom、bounce、glow、强阴影和胶囊化。

### Level 2 — Reading Rhythm

适用于 Home Hero、页面标题区和整体 section 进入。

- 时长：400–700ms。
- 表现：`opacity` 加 `translateY(8–16px)`；Hero artwork 可使用 `translateX(8–12px)`。
- 一个 section 作为整体进入；不逐字、逐 bullet、逐 metadata 飞入。
- 文章正文不做逐段 reveal。

### Level 3 — Ambient Motion

只适用于少量边缘 Narrative 装饰，例如 About/Home 的植物。

- 时长：8–12s，极少量使用。
- 幅度：`translateY` 不超过 2px，`rotate` 不超过 0.5deg。
- 默认可取消；手机和低动态模式优先保持静态。
- Hero 人物、纸纹、网点、枝叶转场和正文不做持续运动。

## 4. Tokens

目标 token 由 `css/base.css` 持有，组件不得自定义 cubic-bezier：

```css
--motion-fast: 160ms;
--motion-normal: 220ms;
--motion-slow: 520ms;
--motion-ambient: 10s;
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
--ease-enter: cubic-bezier(0.22, 0.8, 0.24, 1);
--ease-exit: cubic-bezier(0.4, 0, 1, 1);
--ease-emphasis: cubic-bezier(0.16, 1, 0.3, 1);
```

现有 `--motion-fast`、`--motion-normal`、按下位移和硬阴影属于兼容 primitive；实施时逐步迁移到统一 token，不改变控件的稳定尺寸。

## 5. Gradient system

Gradient 只能是小面积 accent，不是页面背景：

- 优先用于手绘 underline、Hero `Sywen!` 的短 accent、极少量 hover edge 和现有 tape 的 tonal variation。
- 允许的色调：paper white、blue gray、rose gray、sage gray；一次只使用一个主要 accent。
- 推荐采用伪元素或 `color-mix`，避免整段标题 `background-clip: text`。
- 禁止大面积蓝紫渐变球、aurora、霓虹、RGB 流动、整页渐变动画和动态 paper grain。
- 若使用 animated gradient，周期为 10–20s，并必须在 reduced-motion 下静止；Phase 3 前不启用。

## 6. Component rules

### Navigation and links

`.site-nav__link`、`.brand`、`.section-header__link`、`.post-back`、`.post-entry__link` 和 `.tag` 使用统一的墨线/下划线反馈。Active 状态必须独立清晰，不依赖 hover。

### Buttons

`.button`、`.theme-toggle`、`.menu-toggle` 和 `.category-button` 使用 Level 1 反馈。CTA 可以使用从 0 到 100% 的 paper/ink fill，但保持硬边、对比度和现有 pressed shadow。主题切换不旋转、不发光、不改变插画。

### Cards and entries

`.post-entry`、首页分类入口和 About 的状态面板可使用 2–3px 的轻微抬升、边框或墨色加强、标题 emphasis 和箭头 2–4px 位移。卡片本体不 scale，不使用玻璃扫光。

### Decorative elements

装饰继续属于 Narrative Layer，保持 `aria-hidden`、不可聚焦、`pointer-events: none`、不覆盖交互元素、不进入 Article 的 740px 阅读列。装饰 motion 不得改变布局。

## 7. Page rhythm

- Home：Hero 可采用 `eyebrow → title → intro → CTA → art` 的有限 stagger；人物只做一次性 opacity + 小幅横向进入。
- Blog：索引本身是主焦点。筛选区与结果可作为整体进入，文章条目只保留 Level 1 反馈。
- About：section 整体进入；植物若实现 ambient motion，只作为边缘依附装饰。
- Article：标题区可轻微进入；正文、代码、表格、引文、背景纸纹保持静态。进度线、复制提示和焦点反馈只做必要反馈。
- Page transition：默认不拦截导航、不延迟导航、不制造白屏；不是核心实施项。

## 8. Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  /* reveal 直接呈现，ambient 完全停止 */
}
```

必须满足：

- ambient animation 停止；
- reveal 的 opacity 和位移取消，内容立即可见；
- 页面 transition 缩短或取消；
- hover、focus、pressed 的颜色和边框反馈保留；
- 返回顶部继续由 `reading.js` 使用即时滚动；
- 禁用动画后 DOM 顺序、焦点顺序和布局不改变。

## 9. Performance and fallback

只动画 `transform` 和 `opacity`；避免持续动画 `width`、`height`、`top`、`left`、大型 blur 和昂贵 filter。IntersectionObserver 若实现，只观察整体模块，进入一次后解除观察。默认 HTML 必须可见，避免脚本失败留下空白。

## 10. Implementation phases

### Phase 1 — Core Interaction

导航、链接、按钮、分类入口、文章条目和主题控件的统一 Level 1 反馈。验证 hover、focus、pressed、active、布局稳定、浅深主题、无脚本和 reduced-motion。

### Phase 2 — Reading Rhythm

加入 Home Hero 和整体 section reveal，使用单一 IntersectionObserver。Article 只处理标题区，不处理正文段落。验证初始态、稳定态、reduced-motion、图片失败和脚本失败。

### Phase 3 — Ambient Polish

最后评估植物 idle motion 和极少量 gradient accent。若 Phase 1 + Phase 2 已足够自然，Phase 3 直接取消。

## 11. Acceptance

静止页面必须独立成立。验收重点是：没有动态 paper grain；没有正文碎片化动画；Article 仍然最安静；Blog 不变成 dashboard；Home Hero 仍是唯一主焦点；About 装饰不抢内容；无 JS 和 reduced-motion 下所有内容完整可用；320/390/768/1024/1440、Light/Dark、子目录和图片失败均无横向溢出。
