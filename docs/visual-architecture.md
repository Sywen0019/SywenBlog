# 视觉架构契约：Content Layer 与 Narrative Layer

日期：2026-09-18。本文件是本轮视觉架构重构的**契约记录**，先于实现生效。基础版本 `6c454f2`（E02 之后）。`DESIGN_SPEC.md` 保留整体视觉规范，本文件只登记本轮新增的两层结构、可访问性合同、词汇体系与页面密度；两者冲突时以更能保护内容可读性的一条为准。

## 1. 两层结构

| 层 | 负责 | 判定 |
|---|---|---|
| **Content Layer** | 标题、正文、日期与元信息、搜索与筛选、文章摘要、CTA、代码、表格、图示、标签、导航、响应式布局、无脚本降级、图片失败状态 | 缺它页面就不完整 |
| **Narrative Layer** | 人物、学习与生活物件、植物、纸签、网点、短手写旁白、章节编号、小型线稿 mark、页面边缘叙事、区块之间的视觉连接 | 缺它页面仍然完整 |

合同：

1. **Content Layer 优先。** 即使 Narrative Layer 完全消失，页面仍须完整、可读、可操作。
2. **Narrative Layer 不承担关键内容。** 任何叙事元素都不得是唯一的信息来源。
3. 编号（`01`、`02`）属于 Narrative Layer；它重复 Content Layer 已有的顺序信息，因此 `aria-hidden` 后不损失信息。

## 2. Narrative Layer 可访问性合同

以下每一条都是回归门槛，须在 `docs/evidence/visual/` 的检查中可断言：

1. 装饰容器带 `aria-hidden="true"`。
2. 不可聚焦：不使用 `<a>`、`<button>`、`<input>`，不加 `tabindex`；容器内不得出现可聚焦元素。
3. `pointer-events: none`，且不覆盖任何交互元素。
4. 不进入正文阅读列：Post 页 `740px` 阅读列内不得出现 Narrative 元素（用 bounding box 几何断言检查）。
5. 图片失败不得破坏布局：装饰图失败时容器收起或保留既定占位，正文与导航保持完整。
6. 无脚本时不得出现"半成品"外观：Narrative Layer 由 CSS 与静态 HTML 承担，不依赖 JavaScript。

## 3. Narrative Density

| 页面 | Narrative Density |
|---|---:|
| Home | 100% |
| About | 70–80% |
| Blog | 40–50% |
| Article Header | 25–35% |
| Article Body | 5–10% |

原则：**越接近连续阅读，Narrative Layer 越退后。**

每页约束：

- 只允许一个主视觉焦点；
- 每个 section 原则上最多一组辅助 Narrative 元素；
- 手机端每页最多保留一处明显身份元素。

## 4. 页面身份

| 页面 | 身份 | 主焦点 |
|---|---|---|
| Home | Sywen 的桌面 / 笔记本封面 | 现有书桌 Hero（不重画） |
| Blog | Sywen 的文章档案页（Editorial Archive） | 文章索引本身 |
| About | 走进 Sywen 的个人空间 | 现有阅读人物图 |
| Article | Sywen 认真写下的一页笔记 | 正文本身 |

四页必须明显不同，但一眼看得出属于同一个网站。

## 5. 视觉词汇体系

| 类别 | 承担 | 内容 |
|---|---|---|
| **Identity Assets** | "这是 Sywen" | Hero 人物、About 阅读人物、avatar、favicon、红色眼镜 |
| **Narrative Assets** | "Sywen 在这里做什么" | 分类小画、书、平板、咖啡、耳机、植物、学习/阅读/生活物件 |
| **Content Assets** | 解释具体内容 | `search-flow.svg`、代码、表格、流程图、文章级小图 |
| **Decorative Assets** | 只负责节奏 | 胶带、网点、小箭头、纸签、极轻量线条 |
| **Transitional Assets** | 连接 section | 横向枝叶、短线、编号、页面结尾标记 |

人物原则：人物只出现在 Home 与 About。Blog 不使用人物插画。

## 6. Mark System

定位：**Editorial Marks，不是 UI Icon Library。**

第一批最多 8–10 个：`book-stack`、`notebook`、`flower`、`laptop`、`tablet-pen`、`reading`、`coffee`、`headphones`、`arrow-right`、`grid`（archive）。

统一规格：

- `24×24` viewBox；
- `currentColor`；
- `fill: none`；
- `stroke-linecap: round`、`stroke-linejoin: round`；
- 与人物线稿粗细协调。

禁止：在按钮、控件中大量使用 mark，否则会带来 SaaS / Dashboard 图标系统气质。

## 7. Visual Grammar

- **编号**：用于 section、Blog archive、Article heading、Notes；不得作为无意义装饰数字。
- **Paper Slip**：用于 Current status、短旁白、Demo note、FAQ 的少量强调；不得每个模块都变成纸片。
- **植物**：只允许出现在 About、Currently、Footer、少量成长 / ongoing 语义区域。
- **网点**：承担视觉停顿、背景层次、局部 editorial texture；禁止铺满正文。
- **红色**：只用于角色身份与极少量身份细节；不新增大面积粉红或额外品牌色。
- **淡蓝**：承担 current、selected、action、structural highlight。
- **硬边框**：只用于主视觉纸框、交互控件、真正需要框定的 panel、少量状态区。普通 section 优先使用留白、编号、短 rule、背景变化。
- **不规则**：只允许纸签轻微旋转、装饰轻微偏移、编号 / hand-note 非对称落点三种；不制造随机草稿感。

## 8. CSS 职责

**Token 管视觉语言，Page CSS 管具体构图。**

- `css/base.css`：只保留跨页面稳定的 primitive（paper、ink、accent、identity red、border widths、shadow、spacing、content width、z-index、motion、Narrative layer 基础层级）。不把枝叶位置、rotation、section-specific offset、页面专属布局大量 token 化。
- `css/components.css`：基础组件不携带页面构图。`.section-header` 默认是"编号 + 短 rule"，需要完整横线时用 `.section-header--ruled`；`.note-panel` 只作基础内容容器，Narrative 纸面由 `.paper-panel` 承担；`.art-frame` 只负责图片框、边框、fallback 与基础 shadow，比例由页面声明。
- `css/pages.css`：页面构图、比例、section 专属落点。

## 9. 本轮 DOM 与 class 变化（新增契约）

命名沿用 kebab-case；下文列出的 name 一旦实现即为冻结契约，改名须先改本节。

| 新增 | 层 | 用途 |
|---|---|---|
| `.narrative` | Narrative | 装饰容器基类：`aria-hidden`、不可聚焦、`pointer-events: none` |
| `.hand-note` | Narrative | 短手写旁白（CSS 手写体栈，不加载远程字体） |
| `.paper-slip` | Narrative | 纸签：Current status、短旁白、Demo note |
| `.paper-panel` | Narrative | 纸面 panel：About「最近在做」等 |
| `.short-rule` | Narrative | 短分隔 rule，替代无条件全宽 `border-bottom` |
| `.section-number` | Narrative | 编号（`01`、`02`），`aria-hidden` |
| `.mark` / `.mark--{name}` | Narrative | Editorial mark；`<svg class="mark mark--book-stack" aria-hidden="true">` |
| `.page-rail` | Narrative | 宽屏极窄 editorial margin（原型，非 TOC、非导航、非第二正文列） |
| `.section-header--ruled` | Content | 需要完整横线时的 `.section-header` modifier |

Blog 缩略图：按本轮决策**取消**重复的分类缩略图作为默认文章封面，Blog 默认采用"日期 + 编号 + 标题 + 摘要 + 分类 mark"。`.post-entry--with-thumb`、`.art-frame--thumb`、`--entry-thumb-w`、`--entry-thumb-h` 及 `js/site.js` 中对应的缩略图渲染分支在 Phase 1 删除；首页分类卡的小画（`.art-frame--category`、`--category-art-w/h`）保留。

## 10. 实施阶段与样板范围

| Phase | 内容 | 状态 |
|---|---|---|
| Phase 0 | 本文件与 handoff 登记 | 进行中 |
| Phase 1 | 基础 CSS 去构图化：`.section-header`、`.note-panel`、`.art-frame`、Header tools、Blog thumbnail legacy | 待办 |
| Phase 2 | Narrative 词汇：hand-note、paper-slip、short rule、page-rail 原型、mark system、transition assets | 待办 |
| Phase 3 | Visual Vertical Slice：Header、Home Hero、Home Recent Posts、Blog Header + 筛选 + 2 条文章、About Intro、Article Header + 第一节、Footer | 待办 |
| Phase 4 | 样板通过后扩展到全部页面 | 待办 |
| Phase 5 | Responsive / Dark / Failure States | 待办 |

Phase 3 **只实现代表区域**，禁止在此阶段把全部页面铺开；完成后做视觉截图审核，通过才进入 Phase 4。

## 11. 验收补充

现有回归（`scripts/check-baseline.mjs`、`docs/evidence/e01|e02|e03|e04/`）必须继续通过。本轮新增：

- **Narrative Contract**：`aria-hidden`、不可聚焦、`pointer-events: none`、不覆盖交互元素。
- **Article**：Narrative 元素不得进入 `740px` 正文阅读列（bounding box 几何断言）。
- **Blog**：若已取消缩略图，列表 `img` 数为 0；结果计数与实际文章数量一致；filter / reset / no-JS 继续工作。
- **Screenshot Matrix**：Home、Blog、About、Article × 1440 / 1200 / 1024 / 768 / 390 × 浅色 / 深色。
- **Failure / Degradation**：图片加载失败、JS 禁用、深色主题、子目录路径、keyboard focus、reduced motion、长标题、中文换行。
