# Change Log

## 2026-09-19 · 全量发布到 Gitee、GitHub 与 Cloudflare

- 将基线 `a0ed633` 之后的 27 个提交完整推送到 Gitee `origin/main` 与 GitHub `github/main`，最终均为 `44cad1c9b5832d13c7608442a0e2c381440fd3fd`；未压缩提交、未重写历史、未使用 force。
- GitHub `main` 触发 Cloudflare Pages 自动构建，`bash scripts/build-site.sh` 成功生成 36 个发布文件。线上 `version.json` 的 `source_commit` 与 `44cad1c` 一致，`published_at` 为 `2026-09-18T16:53:33Z`。
- 发布产物包含 `ncs-figure-design`、`research-reading`、`deskmate-with-firefly`、`leave-some-space`、`scrna-grn-notes` 五篇文章；三篇旧文章与 `assets/images/search-flow.svg` 均已永久移除并从线上返回 404。
- **验证：** 推送前 baseline **179/0**、E01 三浏览器各 **48/0**、E03 各 **18/0**、E04 各 **20/0**、Narrative **24/0**、paper texture **168/0**；公开三浏览器检查 **18/0**，覆盖搜索、分类、旧分类映射、主题、深链接、键盘、无脚本降级和未捕获异常。首页、Blog、About 与五篇文章线上均为 200。报告见 [public-checks.json](docs/evidence/baseline/public-checks.json)。
- **环境记录：** 两次公开检查因本机 Playwright Firefox 的 `spawn UNKNOWN`／`mozglue` 激活上下文错误未能启动浏览器；改用 gitignored 的 `.tmp-browser/browsers/` 安装后以 `18/0` 通过，未放宽任何断言。
- **状态：** E05/E06 继续保持 `Deferred`，未实现其功能或改变完成状态。实体手机、屏幕阅读器、真实浏览器 UI 缩放与 VC2 仍未验证。收尾 docs commit 推送后线上 `source_commit` 将指向该提交，运行时文件与已验证的 `44cad1c` 相同。

## 2026-09-18 · 用两篇 skill 设计长文替换旧示例

- 永久删除 `posts/attention-intuition.html`、`posts/dom-search-notes.html`、`posts/paper-reading-notes.html`，不提供兼容页或重定向；同时删除仅由旧 JavaScript 文章引用的 `assets/images/search-flow.svg`。
- 新增 `posts/ncs-figure-design.html`《ncs-figure-design 的设计思路》与 `posts/research-reading.html`《research-reading 的设计思路》。两篇均为纯文字五部分长文，正文约 1544／1540 个中文字；沿用现有文章骨架、样式和脚本，不修改 CSS 或 JavaScript 行为。
- 新文均为 `study`、日期 `2026-09-18`、`isDemo: false`、`readingTime: 4`。NCS 文使用 `id: 1` 和标签 `ncs-figure-design / 科研绘图 / 视觉规范`；research-reading 文使用 `id: 2` 和标签 `research-reading / 论文阅读 / 科研工作流`。`window.Sywen.posts` 字段与排序合同不变。
- 当前五篇顺序为 `ncs-figure-design`、`research-reading`、`deskmate-with-firefly`、`leave-some-space`、`scrna-grn-notes`，对应 `A-01` 至 `A-05`；分类统计为 3／1／1。首页最近三篇与 Blog 静态索引、保留文章的相邻导航已同步。
- 同步 README、Plan、PROJECT_PLAN、AGENTS、DESIGN_SPEC、当前交接与视觉架构说明；E01／E03／E04、baseline 和 visual harness 已改用当前页列表与新文代表路径。历史 `docs/evidence/**`、旧 T04 harness、截图和既有结论不改写。
- **验证：** baseline **179/0**；E01 Edge／Chrome／Firefox 各 **48/0**；E03 各 **18/0**；E04 各 **20/0**；Narrative **24/0**；paper texture **168/0**。`bash scripts/build-site.sh` 成功生成 36 个文件，`dist/` 含两篇新文且不含三篇旧文或 `search-flow.svg`。当前运行时、索引与仍需执行的 harness 无旧 slug 残留。
- **未验证：** 实体手机、屏幕阅读器、真实浏览器 UI 缩放、公开部署与 VC2；本轮不推送、不部署，也不宣告 E06 通过。

## 2026-09-18 · 「我喜欢的」新增随笔《和流萤做同桌》

- **新增文章**：`posts/deskmate-with-firefly.html`，分类 `favorites`（我喜欢的），日期 `2026-09-18`，标签「崩坏：星穹铁道／流萤／手办」，阅读时间约 1 分钟。正文严格按用户提供的四行文案排列（用 `<br>` 保留原始断行，「[练剑.jpg]」与「(〃∇〃)」等原始字符未改写），其后接两张配图。文章不是示例，因此文章页不带示例标注，列表元信息也不追加「· 示例」。
- **配图**：两张照片按原字节复制为 `assets/images/deskmate-firefly-01.jpg`（747×640，76,397 B，SHA256 `843a82fe…4cf05f`）与 `deskmate-firefly-02.jpg`（640×944，87,845 B，SHA256 `5de3f442…a79aa906`），复制后哈希与来源逐位一致，未重编码。按用户决定**保留相机水印**（含拍摄时间与 GPS 坐标），不裁剪。这是本仓库第一次在文章正文里放照片，此前 `.post-figure` 只承载过一张 680×180 的流程 SVG。
- **CSS（已实测的等价改动，不是缺陷修复）**：`css/components.css` 的 `.post-figure img` 增加 `height: auto`。在 Edge 153、Chrome 153、Firefox 155 下分别以 1440px 与 390px 运行「保留 `width: 100%`、运行时删掉 `height` 声明」的对照：三个引擎的渲染盒完全相同（740×634 与 740×1092，比例 1.1672／0.6780，与源图 747:640、640:944 四位小数一致）。**原因是这些引擎已从 `width`／`height` 属性推导宽高比，属性提示并不会把高度钉死**，所以这条声明只是把响应式图片的意图写进规则本身，不依赖属性提示；保留它不改变任何已测渲染结果。
- **文案与计数同步**：把「篇数写死在文案里」的说法换成不会随篇数失效的写法——页脚说明由「四篇文章均为示例。」改为「示例文章另有标注。」（各页共用同一条），Blog 页 `page-intro`、归档旁注与 `meta description` 改为按分类描述，About 问答同步，首页分类计数「我喜欢的」由 0 改为 1。
- **编号与排序**：本篇日期为全站最新，按「日期倒序、同日按 id 升序」排在最前；同日另有 `ncs-figure-design`（id 1）与 `research-reading`（id 2，见下一条），因此最终档案编号为 **A-03**。`blog.html` 静态索引、`index.html` 最近文章、文章页 `post-header__index`／`post-rail__number`／相邻导航都从同一顺序推导。
- **验证**：文章页实测（1440／768／390）阅读列分别为 740／720／358px，两张配图各自按固有比例缩放，1440px 下为 740×634 与 740×1092；无横向溢出、无脚本错误、无 4xx。全量复跑：baseline **179/0**、E01 三浏览器各 **48/0**、E03 各 **18/0**、E04 各 **20/0**、Narrative **24/0**、paper texture **168/0**。
- **已知取舍**：保留水印意味着公开页面会显示拍摄时间与 `26°24'12"N 112°50'53"E`，这是用户明确的选择；若之后要移除，替换两张 JPG 即可，尺寸与哈希记在 `docs/acceptance.md`。

## 2026-09-18 · 发布文档转换的「测试样例」文章

- 把用户提供的 `六月.docx`（单细胞 RNA 测序的稀疏与噪声 + GRN 推断术语笔记）转成文章 `posts/scrna-grn-notes.html`：标题《六月：单细胞与基因调控网络笔记》，分类 `study`，日期取文档创建日 `2025-06-27`，正文 3190 字符按 400 字／分钟核定为 8 分钟。正文按 docx 的 14 个编号条目映射为 14 个 `h2[data-rail]`，「定义／成因／影响／示例」与术语子概念用 `h3`，只做中英文间距、引号与句末标点的规范化，不改写内容。
- 新增可选文章字段 `isTestSample`（boolean）；`js/site.js` 的 `createPostEntry` 在 meta 追加 `· 测试样例`，文章页复用已冻结的 `.post-demo-note` 显示「测试样例 · 用于验证文档发布流程」。未新增或重命名任何 id、类名与 `data-*`。
- 日期 `2025-06-27` 使新文在「日期倒序、同日 id 升序」中位于最末，因此登记时现有文章编号不变；随后同一工作区的并行内容调整撤下三篇示例文、新增两篇，本站当前为五篇，新文编号随之变为 `A-05`，`blog.html` 静态索引、`posts/leave-some-space.html` 的「上一篇 · 更早」与 `index.html` 分类计数已与该顺序一致。
- 契约与规格同步：`Plan.md`（字段与当前篇数 3／1／1）、`PROJECT_PLAN.html` §19.2 数据模型表新增 `isTestSample` 行、`README.md`、`docs/agent-handoffs.md`，以及 `docs/evidence/e01`、`visual/narrative-checks`、`e03/reading-checks`、`e04/menu-checks`、`scripts/check-baseline.mjs` 中受影响页列表与计数断言。
- **验证**：定向检查通过——Blog 动态与无脚本静态列表均为 `A-01`…`A-05`，测试样例条目显示「/ 8 分钟 · 测试样例」；文章页 `post-header__index` 与 `post-rail__number` 同为 `A-05`，正文 14 个 `h2`／12 个 `h3`，1440 与 390 无横向溢出、无资源与脚本错误；首页分类计数 3／1／1 与已登记数据一致。本地构建 `bash scripts/build-site.sh` 成功。完整的基线／E01／E03／E04 套件由同一工作区的并行会话重跑，本条目只记录本次可复核的定向结果。

## 2026-09-18 · 让冷灰素描纸的纸齿真正可见

- **根因（像素实测）**：此前 grain 层三处缺陷叠加——① `opacity: 0.015` 时 1–8px 带内亮度标准差仅 0.494，低于 8bit 可感知下限；② `background-size: cover` 把纹理放大约 2.8 倍，细颗粒被插值抹平（同 opacity 改 1:1 平铺后高频振幅 0.665 → 1.388）；③ 纸面容器用不透明实色，把最底层的 grain 完全挡住，凡有内容处都没有纹理。
- **grain 配方**：改为把浓度烘进 SVG alpha（`feColorMatrix type='matrix'`，恒定 45% 灰 + `alpha = 0.16 × 湍流 alpha`），因此不需要元素 `opacity`、也不使用任何混合模式。强度自 0.06 起逐级实测：带内标准差 0.06→0.56、0.09→0.91、0.12→0.96、**0.16→1.11（首个越过门槛 1.0 的档位，故取之）**。
- **平铺取代 cover**：`--paper-grain-size: 256px 256px` + `repeat`。确认 `stitchTiles='stitch'` 有效——1024×768 场地上接缝列 z ≈ −2.0，行列均无接缝。历史"周期性条纹"成因是 `linear-gradient` + 160px 瓦片，不是平铺本身。
- **纸面加纸齿**：`.paper-panel`／`.paper-slip`／`.note-panel`／`.art-frame` 共用一条 `background-image` 规则；`.paper-panel--dots` 把 grain 显式串在网点层之前。
- **亮度补偿**：grain 只能压暗，实测浅色底纸被压暗约 4 个亮度单位；据此把 token 提亮为 `--color-paper: #F6F8FA`、`--color-surface: #FFFEFB`、`--color-subtle: #F1EFEA`、`--color-note: #EDEAE5`。**token 是合成前底色、比最终显示略亮**；渲染后仍落在原先确认的冷灰纸色上（实测 `rgb(240.79, 242.56, 244.06)`，与 `rgb(241, 243, 245)` 每通道差 < 0.5）。
- **深色主题**：不再关闭纸纹，改为中性灰 + 更低强度，避免浅色有纸感而深色完全平坦；`DESIGN_SPEC.md` §3 同步改写。
- **排除的错误路径（均已实测，勿重走）**：`mix-blend-mode: overlay/soft-light` 作用在 `html::after` 上振幅恒为 0（混合背景是画布白底）；`background-blend-mode` 放在 `html` 上造成 −21 ~ −94 亮度偏移；用元素 `opacity` 承载纸齿造成约 −14 漂移。
- **验证**：`paper-texture-checks.mjs` **168/0**（新增纸齿像素与形态断言）；32 场景无横向溢出、文档高度与基线一致；其余回归见 `docs/acceptance.md`。
- **顺带修复既有缺陷**：`css/base.css` 的中文注释此前已被双重 mojibake 损坏（UTF-8 被按 CP936 读回再以 UTF-8 重写；字节证据 `E2 80 94` → `E9 88 A5 3F`）。自动可逆修复不可行（残留 PUA 码位，强制往返会引入 108 个 `U+FFFD`），故逐行重建 65 行受损注释、**CSS 代码逐字保留**（受损 0 行代码），复验 grain 像素数值与修复前完全一致。行尾统一为 LF。
- **操作约束**：不要用 PowerShell 的 `Get-Content -Raw` / `Set-Content` / `WriteAllText` 修改含中文的源码文件（Windows PowerShell 5.1 按系统 ANSI 代码页读写，会损坏 UTF-8 中文）；批量替换请用 Node/Python 并显式指定 UTF-8。

## 2026-09-18 · 实现冷灰素描纸纹理层

- 将纸面材质从 `html/body` 的直接背景改为两个固定 CSS overlay：极弱 radial tonal variation 与独立 SVG grain；不参与布局、不拦截指针、无动画。
- grain 使用 inline SVG `feTurbulence`：`fractalNoise`、`baseFrequency=.85`、`numOctaves=2`、`seed=21`、`stitchTiles=stitch`，灰度处理，最终 overlay opacity 为 `0.015`。
- 保留浅色主纸面 `#F1F3F5`；Dark Theme 与系统暗色同时关闭 tonal/grain 层；未修改页面结构、交互、surface 配色或 JavaScript。
- 验证：纸纹专项 `164/0`；baseline `161/0`（使用工作区 Firefox 路径）；Narrative 契约 `24/0`；Home/Blog/About/Article × 390/768/1024/1440 × 浅深共 32 张截图均无横向溢出。
- 视觉证据见 `docs/evidence/visual/paper-texture/final/`，包含 Home 与 Article 的 1440px 浅色截图。

## 2026-09-18 · 浅色主纸面试色为 #F1F3F5

- 将 Light Theme 的 `--color-paper` 从诊断红色调整为偏冷的 `#F1F3F5`。
- 保持 Panel、Note、纹理实现、Dark Theme、页面结构和交互逻辑不变。

## 2026-09-18 · 浅色主纸面试色为 #F7F7F5

- 将 Light Theme 的 `--color-paper` 从 `#F2F2EF` 调整为更接近中性白的 `#F7F7F5`。
- 保持 Panel、Note、纹理实现、Dark Theme、页面结构和交互逻辑不变。

## 2026-09-18 · 浅色主纸面微调为 #F2F2EF

- 将 Light Theme 的 `--color-paper` 从 `#F2F0EC` 调整为更中性的 `#F2F2EF`。
- 保持 Panel、Note、纹理实现、Dark Theme、页面结构和交互逻辑不变。

## 2026-09-18 · 清理运行时暖黄色残留（本地）

- 定位到 `css/pages.css` 的 `.about-decoration` 仍使用旧暖纸 `#f7f3ea`，改为 `var(--color-paper)`。
- 同步 `PROJECT_PLAN.html` 独立预览 token，避免规格页继续显示旧暖黄色。
- CSS 旧暖色值搜索为 0；未修改插画资产自身纸面或页面结构。

## 2026-09-18 · 修复冷白纸纹理的周期性条纹（本地）

- 定位并移除全局 `linear-gradient(180deg, ...)` 与 `160px` 固定平铺造成的方向性带状/栅格观感。
- 改为单一大尺度 radial lighting，加上 512×512、`feTurbulence`、约 0.025 alpha 的灰度随机 grain；背景禁止重复并使用 `cover`。
- Home、About、Article 1440px 与 Home 390px 人工复核：纸面宏观平坦，未见横向/纵向条纹或网格，长文阅读不受干扰。

## 2026-09-18 · 冷白素描纸主题升级（本地）

- 将浅色页面背景从暖黄色纸面调整为 `#F2F0EC` 冷白灰素描纸；Panel、Note、墨色、辅助文字与分割线同步更新为新的语义 token。
- 新增静态 CSS/SVG paper lighting 与 grain 层，纹理约 0.04 强度，不参与布局、不拦截指针、不使用图片或 JavaScript；Article 正文不铺局部网点。
- Dark Theme 明确关闭浅色纸面背景层，保留原有深色主题结构；页面结构、内容、插画、导航、数据和交互逻辑未改。
- 验证：baseline 161/0、Narrative 24/0；视觉矩阵 40 张（1440/1200/1024/768/390 × 浅深）全部无横向溢出；Light 对比度与 Dark 纹理隔离通过。旧 T04 harness 在历史 `.category-button` 探针处中止，详见验收记录。

## 2026-09-18 · 修复 About「最近在做」植物越界

- 将 About 页植物改为卡片右下角内置定位，在 768px 以上为卡片右侧预留空间，避免越过卡片边界或遮挡第三项状态内容。
- 390px 移动端隐藏 About 植物，与当前窄屏装饰策略一致；新增 About 双色多视口植物回归断言。

## 2026-09-18 · 修复 Home「最近在做」植物与卡片重叠

- 将 Home 页 `.now-slip__plant` 移入 `.paper-panel`，保留植物装饰与现有资源、语义属性及 About 页独立植物布局。
- 在 768px 以上为卡片右侧预留植物宽度，植物按 72px／120px 断点固定在卡片内侧，避免遮挡状态条目、越过卡片边界或制造横向溢出。
- 新增视觉回归断言，覆盖 390／768／1024／1440px 的浅色与深色布局，并复核 About 页植物作用域。

## 2026-09-18 · 取消手写体，旁注改用正文字体

- 用户反馈手写字体不好看。彻底移除手写体的全部实现：删除 `--font-hand` token、`.hand-note` 与 `.hand-note--tilt`，不保留任何手写体回退栈。
- 旁注词汇改为 `.side-note`：正文字体、14px、静音色 `--color-muted`，语气改由字号与颜色承担；新增 `.side-note--marked`（旁注下一条 38×3px 的极短 mark 线）替代手写体提供的"随手记"观感。侧边语气只允许出现在旁注上，正文与标题永远使用正文字体。
- 重命名：`.hand-note` → `.side-note`、`.site-footer__hand-note` → `.site-footer__note-line`。HTML、CSS、契约、交接记录与证据脚本同步更新，仓库内无残留。
- 验证：改后重跑 narrative contract 22/0、baseline 161/0、E01 48/0、E03 18/0、E04 20/0；截图矩阵与对照图重新生成。

## 2026-09-18 · 视觉架构重构：Narrative Layer 与 Visual Vertical Slice（本地，未发布）

- 建立 Content Layer / Narrative Layer 两层结构并先记录契约：[docs/visual-architecture.md](docs/visual-architecture.md)。可访问性合同为 `aria-hidden`、不可聚焦、`pointer-events: none`、不覆盖交互元素、不进入 Post 740px 阅读列、图片失败不破坏布局、不依赖 JavaScript。
- Phase 1 基础 CSS 去构图化：`.section-header` 去掉无条件全宽横线（默认编号＋短 rule，需要时用 `.section-header--ruled`）；`.note-panel` 降为纯分组容器，纸面移到 Narrative 的 `.paper-panel`；`.art-frame` 移除写死的 320/600，比例改由页面用 `--art-ratio` 声明；Header 工具按钮改为紧凑图标按钮（手机 40px、≥768px 44px，保留 accessible name、title 与焦点环）。
- Blog 缩略图决策：取消按分类重复的小画作为默认文章封面。删除 `.post-entry--with-thumb`、`.art-frame--thumb`、`--entry-thumb-w/-h` 与 `js/site.js` 的缩略图分支；Blog 条目改为日期＋档案编号＋标题＋摘要＋分类 mark。首页分类小画保留。
- Phase 2 Narrative 词汇：`css/narrative.css` 提供 `.narrative`、`.hand-note`、`.paper-slip`、`.paper-panel`、`.short-rule`、`.section-end`、page-rail 原型、胶带、网点、转场枝叶与植物容器；`assets/icons/marks.svg` 提供 14 个 Editorial Mark（24×24 viewBox、`currentColor`、`fill:none`）。`--font-hand` 只用本机字体，楷体优先，避免中文旁白落到细衬线回退。mark 定位为 editorial annotation，不进入按钮与控件。
- Phase 3 只做样板区域（用户确认范围）：Header、Home Hero／Recent／Categories／Now、Blog Header＋筛选＋条目、About 各区块、Article Header＋正文 rail、Footer。其它页面内容未铺开。
- 验证：新增 `docs/evidence/visual/narrative-checks.mjs` 契约检查 22/22；`capture.mjs` 产出 1440／1200／1024／768／390 × 浅深共 40 张 before/after 对照，无横向溢出；基线 161/0；E01 Firefox 48/0；E03 Firefox 18/0；E04 Firefox 20/0。修复过程中发现并修掉三处：手写字体栈、390px 首页植物跨边界造成的 8px 横向溢出、档案编号应跟随文章而不是跟随筛选结果。
- 复核补齐：`.note-panel` 在 About 仍带着 E02 时期的边框、网点与阴影，与 Phase 1「`.note-panel` 只负责分组」冲突。纸面改由页面自己的 `.about-now__panel` 声明，并**不再使用网点**——Home 的 Currently 才是笔记本封面，About 更像内页，两页因此保留不同气质；顺带删除已无引用的 `.about-now__decoration` 规则。契约表同步修正为实际实现的 `.section-header__number`／`.post-entry__number`／`.post-header__index`／`.post-rail`（原先误记为 `.section-number`）。改后重跑全部套件仍为 22/22、161/0、E01 48/0、E03 18/0、E04 20/0。未推送、未部署；正式 VC2 与全域扩展仍属 Phase 4／5 与 E06。

## 2026-09-17 · 修复本地直开时头部工具图标空白

- 修复直接打开 `index.html` 等页面时，外部 SVG `<use>` 在 `file://` 下无法渲染导致主题与快捷菜单按钮只剩空边框的问题；`js/site.js` 为静态与动态 Editorial Marks 增加同源内联降级，HTTP/HTTPS 仍使用 SVG sprite。
- 提高主题图标切换选择器优先级，浅色只显示月亮、深色只显示太阳。
- 验证：Chrome／Firefox 的 `file://` 与 HTTP 定向检查通过，主题切换与快捷菜单可用；Edge／Chrome smoke 检查通过，Firefox 标准启动器的环境级 `spawn UNKNOWN` 另以仓库内 Firefox 可执行文件定向复核通过。

## 2026-09-17 · About 页面视觉节奏优化（本地，未发布）

- 删除“关于我”与“学业方向”之间独立悬浮的 A08 枝条贴纸；保留右上人物阅读插画作为 About 页主视觉锚点。
- 将 A07 盆栽从“最近在做”标题旁移至卡片组底边的附属位置；桌面小尺寸显示，移动端隐藏，避免进入正文安全区或制造独立留白。
- About section 改用分层留白组织阅读节奏，移除重复顶部横线；“最近在做”保留统一三列网格，增加克制的纸面网点、内框和边缘线条，不旋转或错落卡片主体。
- 适度增强 About 内容宽度、标题层级、正文行高和卡片间距，未修改公共容器、其他页面或主题逻辑。
- 验证：About 专项多视口检查 18/18 通过；CSS/token 静态审计部分通过。完整渲染检查器因既有探针对缺失元素直接调用 `getComputedStyle` 中止，未形成有效全量结果。

## 2026-09-17 · E02 About 与静态转场（本地，未发布）

- Codex 内置 image_gen 生成 A02 平板阅读人物：1 个初稿、2 次定向修订，采用第 3 稿，保留三视图身份、红色下半框与纯线稿；640/1280 WebP 为 26786/83194 字节。About 桌面文图两列、手机单列，等比完整构图、准确 alt、响应式资源及失败占位。
- 采用豆包 A07 铃兰 v04（最近在做标题旁）与 A08 横枝 v01（介绍至学业静态衔接），WebP 14930/14476 字节；装饰不可聚焦、aria-hidden、pointer-events:none，深色保留纸面。双叶小枝备用。
- 14 张豆包 PNG 无损迁入 gitignored art-work/decorations，A02 母版和候选存 art-work/about；新增确定性导出脚本、资产清单、实际提示词与 E02 检查。已有未提交的豆包日志和抠底脚本保留。
- 验证：E02 专项 18/0；baseline 161/0；E03 Edge/Chrome/Firefox 各 18/0；1440/390 浅深实际前后看图，320/768/1023/1024 布局、失败/无脚本/子目录、DPR2/预算与占位检查通过。构建 31 文件，母版候选未进入 dist，HTML 文字不变。E04 最终结果见 acceptance 的 E02 记录。
- E03 资产检查兼容经过哈希验证的母版迁移；E04 对照改为同页解码后仅切换按钮，保持正文零像素差断言；修复回归发现的菜单立即 Esc 被待执行回调重开问题，并增加确定性竞态用例。豆包完整提示词和工具回执待交接；实体手机、真实 UI 缩放与屏幕阅读器未测。未推送、未部署，正式 VC2 留 E06。

## 2026-09-16 · E01 文章小画体系（本地，未发布）

- 为 study/life/favorites 三个一级分类各产出一张无人物、无文字 4:3 小画（Seedream 5.0 Pro 图生图，以 Hero J 为画风/暖纸参考）：study 为叠放的书＋书签＋合上的笔记本电脑，life 为摊开手账＋笔＋咖啡，favorites 为单盆向日葵盆栽（耳机与杨枝甘露经用户反馈移除）；study/life 纯墨线不上红、仅极淡蓝点缀，favorites 克制上色。母版存 gitignored 的 `art-work/categories/`。
- 新增 `scripts/export-category-art.py` 确定性导出 640×480 WebP（q88 method 6、无元数据、≤40KB）并生成 `docs/category-assets.json`；产物 `assets/images/cat-{study,life,favorites}.webp`（18406/18234/29072 字节）。
- 融合：分类数据新增 `image`；`Sywen.createPostEntry(post, headingLevel, options)` 新增第三参，Blog 动态列表与无脚本静态列表渲染分类缩略图，首页分类入口改为上图下文卡片（手机横卡、桌面三列），首页「最近文章」保持纯文字；缩略图装饰性空 alt、懒加载、失败收起。
- 验证：新增 `docs/evidence/e01/illustration-checks.mjs`，Edge/Chrome/Firefox 各 49/0；全量基线 161/0；E03 阅读增强回归各 18/0（第 18 项改对 E01 后博客列表像素基线、第 8 项补按钮可见性等待）、E04 复制与菜单回归各 19/0（第 19 项改实测文档高度）。未推送 Gitee、未部署 Cloudflare、不宣布 VC2，发布留 E06。

## 2026-09-16 · A08 转场枝叶与双叶小枝贴纸（本地，A07 v04 风格定版后）

- A07 铃兰 v04 经用户确认作为风格基准；用 `image_edit`（`model_version=seedream_5.0_pro`，以 v04 母版与 `参考素材/背景参考图.png` 为参考）生成两张静态装饰：横向枝叶（工具回传 3546×1182，约 3:1，七枚互生小叶加末端紧卷小芽，枝条细弧、两端完整不出画、不形成粗分隔线）与双叶小枝（两叶一顶芽）。
- 双叶小枝 v01 的茎为双线勾边，80px 下茎发虚；v02 改为单根实黑细茎（下半段仍残留一条很淡的副线，小尺寸合并为实线，80px 复核通过），定为最终版；v01 文件保留。
- `scripts/lineart-key-transparent.py` 扩展为任意比例画布并新增 `--square` 与游离墨点清除；成品：`assets/images/a08-transition-branch-v01.png`（3960×1316 RGBA，四边安全区 12.5%，约 179KB，抠底 `--white-cut 244`，清 4 个杂点）、`assets/images/a08-leaf-sticker-v02.png`（2404×2404 RGBA，安全区约 12.5%–13.6%，约 134KB，`--white-cut 244 --square`，清 7 个杂点）；原始输出为同名 `-white-master.png`。
- 验证：两张成品四角与空区 alpha 全为 0、无远离主体组件，米色 #f7f3ea 与深灰底合成无白边；横枝在 90px/60px 高度下叶序与枝弧清晰、视觉轻盈；小枝在 200/110/80px 下茎、两叶与芽均可辨。母版均未做 25KB 压缩，留给网页侧处理。未提交、未部署。

## 2026-09-16 · A07 盆栽贴纸 v04：生长动势与生命力（本地，待确认）

- 用户认可 v03 线条层次但觉得缺少生命力；继续用 `image_edit`（`model_version=seedream_5.0_pro`）以 v03 母版为 [img0] 做姿态调整，不增加元素密度：叶片打破对称（一枚挺拔后扬、一枚外展弯垂且叶尖翻卷、基部加一枚紧卷新芽），两支花茎改为不对称弹性弧度，铃铛朝向俯仰各异并含半遮于叶后的处理，土面加极细小草芽；行笔加入轻微粗细起伏与颤笔。
- 原始输出 `assets/images/a07-plant-v04-white-master.png`（2048×2048，本版淡灰雾更明显，空区最低亮度约 243）；抠底参数收紧为 `--white-cut 242 --speck-area 40`，输出 `assets/images/a07-plant-v04.png`（2482×2482 RGBA，安全区左右 12.5%、上下 14.0%，墨色 RGB 16/15/15，约 350KB），清除 3 个游离杂点（2–10px）。
- 验证：四个空区 alpha 全为 0、无远离主体组件，米色 #f7f3ea 与深灰底合成无白边无灰雾；110px 缩略花序与叶姿可辨；深墨像素 108.9k（v03 为 96.5k），增量来自动势线条，轮廓仍为细线；翻卷叶尖处有一组局部弯线表现叶背扭转，是全图最密的一组线。v01–v03 文件保留。A08 待确认后制作。未提交、未部署。

## 2026-09-16 · A07 盆栽贴纸 v03：铃兰花量加密、线条加层次（本地，待确认）

- 用户反馈 v02 花朵太少、线条过于简单；继续用 `image_edit`（`model_version=seedream_5.0_pro`）以 v02 母版为 [img0] 做 I2I 丰富：单支花茎改为高低两支拱形花茎，共约 13–14 枚含盛开铃铛、半开小铃与尖端花苞；叶片补 2–3 根细次级叶脉，铃铛补铃口齿缺与花蕊点，交叠处仅少量疏排线，盆口/土面/底足加细轮廓，线宽维持 v02 的纤细水平。
- 原始输出 `assets/images/a07-plant-v03-white-master.png`（2048×2048，白底带淡灰雾）；`scripts/lineart-key-transparent.py` 新增游离墨点清除（连通域 + 距主体距离判定，`--white-cut 246 --speck-area 40`），输出 `assets/images/a07-plant-v03.png`（2511×2511 RGBA，安全区上下 12.5%、左右 16.4%，墨色 RGB 18/17/17，约 318KB），共清除 4 个远离主体的细小杂点（2–25px），花蕊等包围式小点按距离规则保留。
- 验证：复检无远离主体的游离组件；米色 #f7f3ea 与深灰底合成无白边；110px 缩略花串呈可辨的铃状花序，较 v02 明显改善；深墨像素 66.3k→96.5k，增量主要为细线，轮廓线宽未加粗。v01/v02 文件保留。A08 待风格确认后制作。未提交、未部署。

## 2026-09-16 · A07 盆栽贴纸 v02：改铃兰、细化线条（本地，待确认）

- 用户反馈对绿萝无感觉且要求线条更细；A07 改用内置 `image_edit` 并显式指定 `model_version=seedream_5.0_pro`（按 seedream-50 → doubao-creative-design 串行规则组装 I2I 提示词），以 v01 母版为 [img0]（盆器与构图基础）、Hero 与背景参考图为 [img1]/[img2]（仅线条语言）重绘为铃兰盆栽：两枚修长披针形叶加一枚内叶、单支拱形花茎垂七枚钟形小花，盆器与居中构图不变。
- 原始输出 `assets/images/a07-plant-v02-white-master.png`（2048×2048，纯白底，背景带极淡灰雾）；同脚本 `scripts/lineart-key-transparent.py` 以 `--white-cut 246` 抠底，输出 `assets/images/a07-plant-v02.png`（2330×2330 RGBA，安全区上下 12.5%、左右 29.7%，墨色 RGB 23/23/21，约 199KB）。
- 验证：空区 alpha 全为 0，米色 #f7f3ea 与深灰底合成无白边；线宽客观对比 v01，深墨像素由 115.7k 降至 66.3k（-43%），二次腐蚀残留粗线由 11.7k 降至 6.9k；110px 缩略时盆与叶清晰、垂铃偏淡但可辨。v01 绿萝版文件保留未删。A08 待风格确认后制作。未提交、未部署。

## 2026-09-16 · A07 盆栽贴纸风格试样（本地，待确认）

- 新增装饰素材 A07：小型绿萝盆栽线稿贴纸，minimal manga / editorial paper 风格，细黑轮廓、叶片与盆身留白、仅极少量疏线，无人物、文字、填色与投影。
- 出图工具为内置 `image_edit`（模型参数 `seedream_4.5`，1:1、2048×2048、纯白底），以 Hero 成图与 `参考素材/背景参考图.png` 作线条参照，未复刻人物与场景；原始输出留存为 `assets/images/a07-plant-v01-white-master.png`。
- 新增 `scripts/lineart-key-transparent.py`：按亮度抠除白底并自动补足四周安全区，输出真透明 RGBA 母版 `assets/images/a07-plant-v01.png`（2246×2246，四周安全区 12.5%–20.8%，墨色 RGB 16/16/13，约 203KB；网页侧再自行压缩到 25KB 目标）。
- 验证：四角与原淡灰雾区域 alpha 均为 0；在站点米色底 #f7f3ea、深灰底上合成无白边；110px 缩略下盆与枝叶仍可辨。A08 转场枝条与双叶小枝待风格确认后再制作。未提交、未部署。

## 2026-09-16 · 分类调整后的任务计划同步

- 同步实施计划、29 节总规格与视觉规范：三类定位、3／1／0 篇数、旧参数兼容、空分类提示及文章归属；保留四类页面与已有标签。
- E01 改为学业／生活／我喜欢的三类小画，保持 Deferred；E06 纳入分类发布核验与演示更新，任务索引登记分类已本地完成、待发布。
- 修正总计划中 E03／E04 状态，预算标为原估算；保留历史验收。本轮仅改计划文档，验证文档链接、HTML 结构及规则一致性，不重复全站测试，不出图或发布。

## 2026-09-16 · 博客分类调整（本地）

- 一级分类由「人工智能／编程／科研／生活」调整为「学业／生活／我喜欢的」；三篇学习类示例文章归入 `study`，生活随笔保留 `life`，`favorites` 暂无文章。
- 首页、文章列表筛选、四篇文章分类链接、静态降级索引、站点介绍、FAQ、页标题与七页页脚同步更新；Header 英文副标题同步为 `Study · Life · Favorites`。
- `blog.js` 为旧的 `ai`／`coding`／`research` 查询参数提供到 `study` 的兼容映射并规范化地址；“我喜欢的”无关键词时显示专属空分类提示，保留原有搜索无结果状态。
- 更新基线检查与演示脚本；Edge／Chrome／Firefox 本地回归 **161 项通过、0 失败**，归档首页、筛选和“我喜欢的”空分类截图。未推送、未部署，线上地址仍按现有发布流程处理。

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
