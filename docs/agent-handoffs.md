# Agent 交接记录（H）

本文件是 Plan.md §2.2 规定的统一交接记录 H 的索引与正文，只作为执行记录，不增加产品功能或运行时依赖。

集成负责人：DeepSeek（归入 T00、T11、T17、T21、T22）。并行任务只返回交接内容，不直接编辑本文件。

## H 记录格式

1. Task ID、模型、状态：`Ready / Running / Blocked / Review / Passed`。
2. 基础版本：commit；尚未初始化 Git 时记录输入文件快照信息。
3. 实际修改文件、修改摘要。
4. 新增或使用的 DOM 约定、函数签名、参数、返回值、加载顺序。
5. 自检步骤、实际结果、截图或其他证据。
6. 未验证项、已知问题、是否影响后续任务。
7. 下一任务 ID，以及接手者必须注意的事项。

## 任务状态索引

| Task | 模型 | 状态 | 基础版本 | 记录 |
|---|---|---|---|---|
| T00 执行基线与工程准备 | DeepSeek | Passed | `8747276` | 见 T00 |
| T01 七页语义骨架与路径契约 | DeepSeek | Passed | T00 提交 | 见 T01 |
| T02 指定视觉资产派生 | Codex | Passed | `2866ce8` | 见 T02 |
| T03 最小版本部署验证 | — | Blocked（外部阻塞，用户决定延期） | — | 见「延期与未开始任务」 |
| T04 Tokens、公共组件与响应式基础 | DeepSeek | Passed | `4f91102` | 见 T04 |

---

## T00 — 执行基线与工程准备

**模型：** DeepSeek｜**状态：** Passed｜**原阶段：** Stage 0

### 2. 基础版本

- 起始 commit：`8747276b513f29d3a87b037dda40322d5ab3d2ad`（`docs: initialize blog repository`，与 `origin/main` 一致）。
- 起始工作区：`AGENTS.md` 有 3 行未提交改动，`Change_log.md` 为未跟踪空文件，`docs/` 不存在。
- 输入文件快照（SHA256，`参考素材/*.png`，未改动）：
  - `9EDEFBC68C640ED04BB87CC6B65E37CE4FF1B9AE93CEEC9F00AD6EBCEFDEA3BE` 角色三视图.png
  - `9CA9F2E6B7498CACD5F4875C805AD9821EFB24F00AD0FA600BF3D3C776D30F39` 网页参考图.png
  - `EB1659099CA82BB61DEFC5C5D7A29AC7A06567287B95861865C96F11D0BD4E43` 网页辅助参考1.png
  - `A0BD66ED7606ECC0355D9DADAC76740C3FEE60B042F7D08356A3B31A3634710E` 网页辅助参考2.png
  - `AD523608735C3FC7019D128D1A130920425F455039D4C6BC31E2925C90A4FBCA` 背景参考图.png

### 3. 实际修改文件

| 文件 | 摘要 |
|---|---|
| `docs/agent-handoffs.md` | 新增，本文件；建立 H 格式与索引 |
| `docs/acceptance.md` | 新增，正式验收记录骨架与 Stage 0／Stage 1 结果 |
| `docs/visual-review.md` | 新增，VC1／VC2 视觉检查点容器与 §5.2 问题格式 |
| `README.md` | 更新当前状态、目录、本地预览、执行记录入口、仓库与推送说明 |
| `AGENTS.md` | 修正过时事实：五张参考 PNG、应用目录已存在、Git 历史已存在；补充 `docs/` 记录说明 |
| `.gitignore` | 新增发布目录／打包产物与编辑器缓存排除项 |
| `Change_log.md` | 写入 Stage 0 条目（倒序） |

### 4. DOM 约定、函数签名与加载顺序

无。T00 不产生运行时接口；T01 起建立 DOM 契约。

### 5. 自检步骤与结果

1. `Get-FileHash -Algorithm SHA256 参考素材\*.png`：与基线一致，原图未被改动或重编码 —— 通过。
2. `git -c http.sslBackend=openssl ls-remote origin`：返回 `refs/heads/main = 8747276…`，远端读权限正常 —— 通过。
3. 默认 schannel 后端 `git ls-remote origin`：`schannel: AcquireCredentialsHandle failed: SEC_E_NO_CREDENTIALS (0x8009030e)` —— 记录为环境限制（见「已知问题」）。
4. 凭据检查：新增文件与既有跟踪文件中无账号、令牌、私钥；`.gitignore` 覆盖 `.env*`、`credentials.json`、`*.pem`、`*.key`、`.ssh/` —— 通过。
5. `git check-ignore -v docs/acceptance.md 参考素材/角色三视图.png`：均未被忽略 —— 通过。

详细数据见 `docs/acceptance.md`「阶段 0」与「阶段 1」。

### 6. 未验证项与已知问题

- Netlify 账号与公开 HTTPS 条件未验证：本环境无登录态，且用户决定本轮只实施 T00／T01 → T03 记为外部阻塞并延期。
- Git 推送认证：已在放宽沙箱权限后验证通过；Stage 0／Stage 1 里程碑与后续文档提交均推送成功，`git rev-list --left-right --count origin/main...main` 为 `0 0`。默认沙箱下凭据助手无法启动（OB-01 已关闭）。
- 已知问题（不扩大修改范围）：仓库无 `.gitattributes`，Git 提示 `LF will be replaced by CRLF`。`.gitattributes` 不在 T00 允许修改清单内，本轮不新增，仅记录，供后续任务决定。
- 不影响后续任务：以上均不阻塞 T01 及 Stage 2。

### 7. 下一任务

T01（本文件下方记录）、T02。接手者注意：CSS 与 JS 尚不存在，T01 页面不得引用它们（资源引用属于 T04 范围）。

---

## T01 — 七页语义骨架与路径契约

**模型：** DeepSeek｜**状态：** Passed｜**原阶段：** Stage 1

### 2. 基础版本

- 起始 commit：`b267dc326cf5cb303f856be467692d00ff3493b0`（`docs: define implementation baseline and delivery checklist`）。
- 输入：`Plan.md` 第一部分「页面、样式与资产架构」、`PROJECT_PLAN.html` §7、§9～§14、§19.3、§20.3、§21。

### 3. 实际修改文件

| 文件 | 摘要 |
|---|---|
| `index.html` | Home 骨架：Hero、最近文章（前三篇）、四类分类入口、最近在做 |
| `blog.html` | Blog 骨架：标题说明、隐藏筛选区、隐藏动态结果容器、隐藏无结果状态、静态四篇索引 |
| `about.html` | About 骨架：关于我、学习方向、兴趣、最近在做、三组静态问答 |
| `posts/attention-intuition.html` | 人工智能文章骨架 |
| `posts/dom-search-notes.html` | 编程文章骨架 |
| `posts/paper-reading-notes.html` | 科研文章骨架 |
| `posts/leave-some-space.html` | 生活文章骨架 |
| `docs/acceptance.md` | 追加阶段 1 验收结果 |
| `Change_log.md` | 追加 Stage 1 条目 |
| `README.md` | 更新当前状态与目录 |

### 4. DOM 约定与路径契约（后续任务沿用）

**页面标识**

- `<html lang="zh-CN" data-site-root="…" data-page="…">`；顶层页 `data-site-root="./"`，文章页 `data-site-root="../"`。
- `data-page` 取值：`home`、`blog`、`about`、`post`；文章页额外 `data-post="<slug>"`，与 `posts-data.js` 的 `slug` 一致。
- 当前页标记：顶层页在对应导航项使用 `aria-current="page"`；文章页属于“文章”分区而非该页面本身，使用 `aria-current="true"`。两者在每页各出现一次。

**路径**

- 顶层页引用 `./css/…`、`./js/…`、`./assets/…`；文章页一律 `../css/…`、`../js/…`、`../assets/…`、`../blog.html`。
- 数据文件内路径相对站点根，由 `resolveUrl` 解析；禁止域名根路径与硬编码域名。

**JS 钩子 ID**

| ID | 页面 | 用途 |
|---|---|---|
| `#main` | 全部 | 跳到主要内容目标 |
| `#theme-toggle` | 全部 | 主题切换按钮（默认 `hidden`） |
| `#quick-menu-button` | 全部 | 快捷菜单按钮（默认 `hidden`） |
| `#reading-progress` | 全部 | 顶部阅读进度 `progressbar`（默认 `hidden`） |
| `#back-to-top` | 全部 | 返回顶部（默认 `hidden`） |
| `#site-notice` | 全部 | 统一状态提示（`role="status"`，默认 `hidden`） |
| `#copy-panel` | 全部 | 手动复制面板容器（默认 `hidden`） |
| `#context-menu` | 全部 | 自定义菜单容器（`role="menu"`，默认 `hidden`） |
| `#home-recent` | Home | 首页最近文章列表（静态降级内容） |
| `#home-categories` | Home | 分类入口列表 |
| `#blog-filters` | Blog | 筛选工具区（初始化成功后才显示） |
| `#search-form` / `#search-input` | Blog | 搜索表单与输入框 |
| `#blog-categories` | Blog | 分类按钮组 |
| `#result-count` | Blog | 结果数量（`role="status"`） |
| `#reset-filters` / `#empty-reset` | Blog | 重置筛选 |
| `#blog-results` | Blog | 动态结果容器（默认 `hidden`） |
| `#blog-static-list` | Blog | 静态索引，动态列表成功初始化后隐藏 |
| `#blog-empty` | Blog | 无结果状态（默认 `hidden`） |

**data 属性**：`data-category`、`data-category-count`、`data-post-id`；后续菜单豁免区域使用 `data-menu-exempt`。

**类名**（kebab-case，BEM-lite，均已在七页中使用）：`.skip-link`、`.container`、`.site-header(#__inner)`、`.site-title`、`.brand(#__name/__tagline)`、`.site-nav(#__list/__item/__link)`、`.site-tools`、`.theme-toggle`、`.menu-toggle`、`.site-main`、`.page-header`、`.page-title`、`.page-intro`、`.site-footer(#__inner/__brand/__note/__links/__copyright)`、`.button(--primary/--secondary/--quiet)`、`.category-list(#__item)`、`.category-link`、`.category-button`、`.category-count`、`.tag-list`、`.tag`、`.post-list`、`.post-entry(#__category/__title/__link/__summary/__date/__more)`、`.blog-filters`、`.blog-search`、`.field(#__label/__input)`、`.result-bar(#__count)`、`.blog-results`、`.note-panel(#__list/__item/__label/__text)`、`.status-notice`、`.copy-panel`、`.context-menu(#__group/__item/__progress)`、`.reading-progress`、`.back-to-top`、`.empty-state(#__title/__text)`、`.hero(#__text/__title/__intro/__actions)`、`.hero-art(#__frame/__image/__caption)`、`.art-frame`、`.home-section`、`.section-header(#__title/__link)`、`.about-section`、`.text-list`、`.post`、`.post-back`、`.post-header`、`.post-meta(#__category/__date/__time)`、`.post-demo-note`、`.post-body`、`.post-nav`、`.faq-list(#__question/__answer/__label)`。

后续任务只使用上表类名做样式钩子；新增状态类沿用 `.is-…` 形式或 `aria-*` 属性，不重命名既有类名。

**T04 需要在七页插入的资源引用与标记**（本轮未加入，避免引用不存在的文件）：

- 三个样式表：`<link rel="stylesheet" href="<root>/css/base.css">`、`components.css`、`pages.css`；以及 `<link rel="icon" href="<root>/assets/icons/favicon.svg" type="image/svg+xml">`。
- Home Hero：`.hero-art` 图框（`character-front-upper.webp`，固有 320×600，空替代文本）与旁白“学习中，持续更新。”（`.hero-art__caption`）。
- About：同一角色图（替代文本“Sywen 的漫画角色形象：短发、红框眼镜和格纹衬衫”）。
- Blog 无结果状态：`.empty-state` 头像（`character-front-avatar.webp`，固有 225×225），位于文案与重置操作之后。

**公共 HTML 同步清单**（七份文件必须一致，除 `aria-current`、相对根、页面标题／描述／正文外）：跳转链接、Header 块、Footer 块、七个增强控件挂载点、后续加入的 CSS 链接与脚本加载顺序。

**加载顺序（T10 起执行）**：`theme.js`（头部提前）→ `posts-data.js` → `site.js` → 页面功能（`blog.js`）→ `reading.js` → `context-menu.js`，除主题脚本外使用 `defer`。

### 5. 自检步骤与结果

详见 `docs/acceptance.md`「阶段 1 执行输出」。摘要：

- 结构检查（临时脚本，经 stdin 运行）：七页 `lang`／`data-site-root`／`data-page` 正确，各 1 个 `h1`，标题与描述七页唯一，跳转链接指向 `#main`，七个增强控件均带 `hidden`，无 `<script>`／样式表／`<img>` —— PASS。
- 链接解析：全部内部 `href`（含 `?category=`）目标存在，无死链，无未知分类，文章页统一 `../` —— PASS。
- 本地 HTTP：七页均 200 且返回字节与工作区文件 SHA256 一致，UTF-8 正常，404 反向确认通过 —— PASS。
- Header／Footer 七页一致性：除 `aria-current` 与相对根外完全一致 —— PASS。
- 复检修正：首轮发现文章页缺少当前分区标记，已在四篇文章页补 `aria-current="true"` 后复检通过。

### 6. 未验证项与已知问题

- 文章页状态条（日期、阅读时间）、标签、相邻文章、完整正文属于 T05～T07，本轮未写入，以免产生失实或返工元数据。
- Home「最近文章」与 Blog 静态索引当前采用四篇文章的登记顺序（人工智能、编程、科研、生活），Home 取前三篇。T05 冻结日期后必须按“日期倒序，同日按 `id` 升序”复核该顺序；若最终日期不同，需要同步调整 Home 前三篇与 Blog 列表顺序。
- 文章页的 `meta description` 为按主题撰写的临时描述，T05 冻结摘要后需与实际摘要保持一致。
- 文章页现有 2～3 句开篇段是 T01 骨架文本，T06／T07 定稿正文时替换。
- 页面未引用 CSS、JS、图片与 favicon：这些文件尚不存在，引用会产生 404；资源引用由 T04 统一加入。
- 无阻塞后续任务的已知问题。

### 7. 下一任务

T02（角色 WebP 与 favicon）、T04（Tokens 与公共组件）。接手者必须使用本文「DOM 约定与路径契约」，不得重命名既有 ID 与类名；T04 负责为七页加入样式挂钩引用与资产引用，T05 起填充日期、摘要、分类数量与正文。

---

## 延期与未开始任务

| Task | 状态 | 说明 |
|---|---|---|
| T02 指定视觉资产派生 | Passed | 已于 2026-09-15 完成，见 T02 交接。原会话缺少图片输入能力是历史限制，当前会话已完成目视核对。 |
| T03 最小版本部署验证 | Blocked | 外部阻塞：本环境无 Netlify 登录态／令牌，且用户决定本轮先完成 T00／T01。未产生任何部署地址，不得记为通过。后续在 T22 前关闭。 |
| T04 Tokens、公共组件与响应式基础 | Passed | 已于 2026-09-15 完成，见 T04 交接。三个 CSS 文件与七页资源引用已落地；Stage 2 任务集（T02＋T04）完成。 |

## T02 — 指定视觉资产派生

1. **执行者／状态**：Codex（本会话实际执行者；未调用 DeepSeek）／Passed。2026-09-15 同时复验 T00、T01 通过。
2. **基础版本**：`2866ce8f55574bf1a475668e83a735f32f2830f7`；起始工作区干净，远端 main 一致。
3. **修改**：新增 `assets/images/character-front-upper.webp`、`assets/images/character-front-avatar.webp`、`assets/icons/favicon.svg` 和 `docs/evidence/t02/` 证据；更新验收、交接、变更日志与 README，并修正 Plan／AGENTS 当前进度。七页 HTML 和既有 DOM／路径契约未变。
4. **资产接口**：上身图 `(120,0,320,600)` → 320×600、28,910 字节；头像 `(175,0,225,225)` → 225×225、8,900 字节；Pillow 10.4.0 / libwebp 1.3.2，quality=90、method=6，无额外元数据。favicon 24×24、2px 线条、315 字节。完整 SHA256 见 [asset-report.json](evidence/t02/asset-report.json)。无新增 JS 接口。
5. **验证**：五张原图哈希未变；格式、尺寸、预算、原图／派生图目视对照通过，裁切无需微调；favicon XML 与 16／32px 渲染通过。Edge 禁用 JS 的七页 HTTP、静态导航、跳转焦点、控件隐藏、公共结构与元数据检查通过。详见 [验收记录](acceptance.md)最新章节和其中证据链接。
6. **限制**：T03 HTTPS 部署继续未验证；本地服务器 WebP MIME 为 application/octet-stream，但 Edge 图片解码通过，正式部署时核验 image/webp。当前视觉核对不替代 VC1／VC2。先前“模型不支持图片输入”仅适用于原会话。
7. **下一任务**：T04 Ready，沿用既定资源路径与固有宽高，负责七页引用；页面不提前引用资产。`search-flow.svg` 属于 T06。Stage 2 尚未整体完成。

---

## T04 — Tokens、公共组件与响应式基础

**模型：** DeepSeek｜**状态：** Passed｜**原阶段：** Stage 2

### 2. 基础版本

- 起始 commit：`4f91102`（`feat: derive character assets and verify T00 T01`）；起始工作区干净，`origin/main` 一致（`git rev-list --left-right --count origin/main...main` 为 `0 0`）。
- 输入：`DESIGN_SPEC.md` §3～§10、§12.1、§14～§16；`Plan.md` 一·2／一·4 与 T04 任务卡；T01「DOM 约定与路径契约」；T02「资产接口」。

### 3. 实际修改文件

| 文件 | 摘要 |
|---|---|
| `css/base.css` | 新增。Token 注册表（颜色与主题、字体与字号、行高字重、间距、宽度、响应式尺寸、线条／圆角／阴影、焦点、控件、菜单提示、装饰、动效、层级）、三套主题块、移动优先响应式 Token、重置与基础排版、`.icon`、`.sr-only`、跳转链接、焦点、减少动态效果 |
| `css/components.css` | 新增。增强控件（阅读进度、返回顶部、状态提示、复制面板、菜单容器）、刊头与导航、按钮族与表单控件、分类／标签／结果工具、文章条目（摘要动作列）、旁白面板与文本分组、问答、分类入口、角色图框与装饰、状态块、菜单项、正文骨架 |
| `css/pages.css` | 新增。容器与主内容／页脚外壳、页面标题区、Home（Hero 3:2、区块节奏、分类入口）、Blog、Post（740px 阅读列）、About（桌面介绍左、角色右） |
| 七页 HTML | 加入三个样式表与 favicon 链接、`<noscript>` 隐藏脚本控件；Home 加 Hero 角色图框（胶带＋网点＋旁白）、分类与「最近在做」补齐 `.section-header`；About 加角色图（含规范替代文本、单胶带）与 `about-intro` 栅格标记；Blog 空状态加头像 |
| `docs/evidence/t04/` | 新增静态审计脚本、渲染检查脚本（Edge headless + CDP）、`render-checks.json`、`render-report.txt`、12 张两主题截图、空状态与聚焦截图、3 张禁用 JavaScript 截图 |
| `docs/acceptance.md`／`docs/agent-handoffs.md`／`Change_log.md`／`README.md`／`AGENTS.md` | 验收结果、交接、变更记录与当前事实同步 |

未改动：既有 id、`data-*`、类名与 Header／Footer 文本；无 `js/`、无 `posts-data.js`、无 `search-flow.svg`（分别属于 T10～T14、T05、T06）。

### 4. CSS 与 DOM 契约（后续任务沿用）

**新增类名（T04 首次定义，不得重命名）**

- 图像框：`.art-frame`、`.art-frame__image`、`.art-frame__fallback`、`.art-frame--avatar`（预留）。
- Home Hero：`.hero-art`、`.hero-art__frame`、`.hero-art__caption`、`.hero-art__tape`、`.hero-art__dots`；About 复用并加 `.about-hero-art`。
- About 栅格：`.about-intro` + `.about-intro__second-column`（角色图列，`grid-row: 1 / span 3`）。
- 其他：`.empty-state__avatar`、`.stat-list`／`.stat`／`.stat__link`／`.stat__count`、`.post-entry__content`、`.field`／`.field__input`、`.result-bar__count`、`.context-menu__group`／`__item`／`__progress`、`.copy-panel__title`／`__actions`、`.icon`／`.icon--hidden`、`.sr-only`。
- 当前导航用 `[aria-current]` 属性选择器表达 700＋2px 下划线，不新增状态类。

**主题契约（T11 实现 `theme.js` 时遵守）**

- 属性：根元素 `<html data-theme="light|dark">`；未设置＝未主动选择。
- CSS 层级：`:root` 浅色默认 → `:root[data-theme="light"]` → `:root[data-theme="dark"]` → `@media (prefers-color-scheme: dark) { :root:not([data-theme]) }`（放最后，保证系统跟随优先于默认浅色）。
- `color-scheme` 只在显式主题下声明；无脚本时由媒体查询跟随系统主题。
- 本轮**未加入**头部内联主题脚本：避免与 T11 的 `theme.js` 形成第二套主题写入逻辑。T11 需决定是否加最小提前设置脚本（加则须与本契约的属性和取值一致）。
- 主题切换过渡只作用于 `html, body` 的 `color`／`background-color`（180ms）；截图或测量前需等待 ≥300ms 或临时关闭过渡。
- 减少动态效果下 `--motion-*` 为 0ms、`--press-shift*` 为 0px、`--decoration-angle` 为 0deg。

**响应式 Token**：`768px` 与 `1024px` 两个断点（另有一处 `max-width: 767px` 隐藏移动端装饰）。`--gutter` 16／24／32px；`--hero-art-height` 220／300／360px；`--about-art-height` 220／240／300px；`--status-art-height` 220／240／240px；`--entry-date-width` 88／88／112px；`--section-gap` 48／48／64px；`--hero-gap` 24／24／48px；`--avatar-size` 64／80／80px。

**布局不变量（已实测）**：`.container` 内容列 = `min(1120px, 视口可用宽 − 2×gutter)`；`--width-site`／`--width-reading` 是**内容**宽度上限，实现时必须用 `calc(var(--width-site) + 2 * var(--gutter))` 计入 gutter；Post 头部与正文同为 740px。`.post-entry` 在 ≥768px 为 `日期列 + 内容列` 栅格，内容要素可包在 `.post-entry__content` 或直接作为条目子元素（两种都已在组件层适配）。角色图用 `aspect-ratio: 320 / 600` + `object-fit: contain` + `max-width: 100%`，因此窄屏下图片宽小于固有 320px 时按比例缩小，不拉伸。

### 5. 自检步骤与结果

1. 静态审计（`docs/evidence/t04/audit.mjs`）：无悬空 `var()`（93 个自定义属性、90 个被引用）；浅色默认块与显式浅色块一致、深色显式块与系统跟随块一致；Token 取值 80 项与 §4／§5／§16 逐项匹配；Mobile／Tablet／Desktop 覆盖值正确；断点仅 768／1024px；无 `transition: all`、无全局 `overflow-x: hidden`；七页资源引用顺序、`data-site-root`／`data-page`、`noscript`、示例与替代文本全部正确 —— PASS。
2. 浏览器渲染检查（Edge 153.0.4234.32 headless + CDP，24 个页面×视口场景 + 12 个断点边界场景）：横向溢出 0、越界元素 0、资源错误 0、图片问题 0、隐藏项异常 0、脚本错误 0、控制台错误 0、布局偏差 0 —— PASS。详见 [渲染报告](evidence/t04/render-report.txt)。
3. 主题与对比度实测：浅色 正文/纸 14.02:1、辅助文字/纸 5.75:1、按钮 12.35:1、面板 15.15:1；深色 12.02／7.91／7.96／10.78 —— 全部 ≥4.5:1（大字与关键控件门槛为 3:1）。静态把 `data-theme` 置为 `dark` 后 `--color-paper` 立即变为 `#202223`。
4. 组件状态实测：次按钮 Hover（真实 `mouseMoved`）由 surface 变 accent；主 CTA 按下位移 2px、阴影由 4px 降为 2px；当前导航 700＋2px 下划线、其余 400 无下划线；输入框高 46px、2px ink、4px 圆角、聚焦 3px 轮廓；分类按钮选中 accent＋700 且 `aria-pressed="true"`；空状态头像 80×80 且位于重置按钮之后。
5. 键盘与禁用脚本：首个 Tab 焦点为 `.skip-link`（3px 轮廓／4px 偏移、视口内可见），Enter 后焦点落到 `#main`；Edge `--disable-javascript` 下三张截图显示样式、导航、静态索引与图片全部可用，增强控件不可见。
6. 首次渲染检查发现 5 项偏差并已修复：`.container` 内容列 1056px（应 1120px，曾把 gutter 计入上限）、About 桌面两列错位、About 角色图 360px 超过 300px 上限（`--about-art-height` 未被引用）、Tablet 角色图未落到 300px 档、Post 头部＋正文 804px 超过 740px；另把网点直径由 2px 修正为 1px、并把胶带改为跨角放置。
7. 像素级复验（直接测量截图，见 [像素复验](evidence/t04/pixel-verification.md)）：上列偏差与胶带跨角、深色标题色、移动端隐藏装饰、空状态顺序均已按预期渲染（内容列 1120px、About/Hero/Tablet 角色图 300/360/300px、胶带 8/8px 与 24/24px 跨角、深色 h1 为逐字节 `#F2EEE5`、390px 无装饰）。
8. 像素复验发现网点的第二次缺陷并已修复：`radial-gradient(ink .5px, transparent .5px)` 在 8px 瓦片内不覆盖任何像素中心，网点**完全不可见**（该区 0 个非纸色像素）。当前实现为「同色 radial-gradient 背景 ＋ 8×8 SVG mask（圆心 (4,4)、r=0.5）＋ 显式 `mask-size: var(--dot-gap)`」，颜色由 `background-color: var(--color-ink)` 经 mask 着色以跟随主题。复测：8px 间隔、每 64×64 片 64 点、浅色 `rgb(242,238,229)`／深色 `rgb(37,38,39)`，均等于 `#F2EEE5` 以 `--dot-opacity` 0.08 与纸色的混色结果。
   - 复现时的两条约束（改动前务必先读）：① mask 的 SVG 必须与 `mask-size` 同为 8×8；只用 1×1 的 SVG 会把圆缩放到整块瓦片，网点铺满约 78% 面积。② 不要退回纯 `radial-gradient`；8px 瓦片中心距最近像素中心 0.707px，0.5px 半径不覆盖任何像素中心。
   - 已知容差：`--dot-size` 声明 1px，Edge 153 在 1× 缩放下实测渲染为 2×2 设备像素的均匀网点；`opacity .08` 下为极淡斑点，保留现状并留给 VC1 复核（2×2 瓦片方案会渲染成 4×4 色块且混色不均，更差）。

### 6. 未验证项与已知问题

- Chrome、Firefox 与真实手机未执行（沿用 OB-03）：本轮只完成 Edge headless。VC1 的正式视觉判定不因本轮截图豁免。
- 本会话模型不支持图片输入：截图由像素直方图／包围盒／行列剖面程序化测量，观感类判据（是否像卡片墙、文字是否拥挤、角色姿态）未由人眼确认，留给 VC1。
- 本机 Edge 在沙箱内启动 headless 并附加 DevTools 会崩溃（`0x80000003`），浏览器检查在放宽沙箱后执行；该环境限制不影响产品代码。
- 已知设计判断保留项：结果工具行的「重置筛选」使用无阴影按钮，以避免 §11.2「状态块无厚边框／工具行不喧宾夺主」与 §7 默认阴影冲突；该变体在 `components.css` 中有注释说明。
- 首页分类入口在 Mobile 下为 42px 高的文本链接（规范 44px 针对常规操作目标，文本链接以行高与间隔保障阅读）。
- Home「最近文章」目前只有分类与标题，日期列、摘要与阅读入口由 T05 按冻结元数据补齐；文章页的日期、阅读时间、标签、相邻文章与复杂正文块由 T06／T07 补齐。
- `search-flow.svg`（T06）、`js/*`（T10～T14）尚未存在，页面未引用，因此无 404。
- 无阻塞后续任务的已知问题。

### 7. 下一任务

T05（Home 与 Blog 静态视觉实现）。接手者注意：

- 沿用本文「CSS 与 DOM 契约」，不要重命名既有类名；新增状态类用 `.is-…` 或 `aria-*`。
- 三个 CSS 文件是共享文件：T05 只能在其页面分区内继续补充，改动共享区段前先合并 T04 提交。
- 首页前三篇与 Blog 四篇的日期／摘要／标签由 T05 冻结；日期元素请使用现有 `.post-entry__date`（≥768px 自动进入日期窄列），内容要素放在 `.post-entry__content` 内或直接作为条目子元素。
- 空状态头像与筛选区状态已就绪：`#blog-filters`、`#blog-results`、`#blog-empty` 默认 `hidden`，JS 初始化成功后显示；不要用 `display` 规则覆盖 `hidden`。
- 两主题截图与禁用脚本证据可直接复用 `docs/evidence/t04/`，但 VC1 必须重新截图。


## 2026-09-15 B/E 基线修订与新增 DOM 契约（当前有效）

用户批准的新 Plan.md / DESIGN_SPEC.md v1.1 替代旧全量首发和模型调度。历史记录不改写。B00–B06当前执行，E01–E06 Deferred。当前执行者Codex；复杂美术按Astra/Codex内置出图，豆包只在E类外部交接。

保留全部既有ID/data标记。新增类：post-entry__content/meta、hero__eyebrow、hero-art--desk、hero-art__picture、section-header__number、about-intro__copy、post-table-scroll、post-figure、post-nav__label。装饰aria-hidden。hero-desk-640.webp / hero-desk-1280.webp 是待B02产出路径，文件存在后才接入；picture设置固有4:3比例。

B04加载：theme.js于CSS前同步；posts-data.js→site.js→仅Blog的blog.js均defer。不加载reading/context-menu。Sywen提供posts/categories、resolveUrl(path)、createPostEntry(post, headingLevel)、getTheme()/toggleTheme()。列表渲染成功才显示筛选并隐藏静态索引，失败保持静态。
