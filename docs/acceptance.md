# 验收记录

## 全量发布与公开部署验收 · 2026-09-19

**范围：** 将基线 `a0ed633` 之后的全部本地工作发布到 Gitee、GitHub，并由 Cloudflare Pages 自动部署。发布区间共 27 个提交，最终运行时提交为 `44cad1c9b5832d13c7608442a0e2c381440fd3fd`。按用户要求，E05/E06 继续保持 `Deferred`，不实现其功能，也不修改任务完成状态。

**远端与部署：**

| 项目 | 结果 |
|---|---|
| Gitee `origin/main` | `44cad1c9b5832d13c7608442a0e2c381440fd3fd` |
| GitHub `github/main` | `44cad1c9b5832d13c7608442a0e2c381440fd3fd` |
| 推送方式 | `git -c http.sslBackend=openssl push`，未使用 force，未重写或压缩历史 |
| Cloudflare Pages | 自动构建 `bash scripts/build-site.sh` 成功，部署版本为 `44cad1c` |
| 线上 `version.json` | `source_commit = 44cad1c9b5832d13c7608442a0e2c381440fd3fd`，`published_at = 2026-09-18T16:53:33Z` |
| 发布产物 | `dist/` 共 36 个文件；包含五篇当前文章，不包含三篇旧文章或 `search-flow.svg` |

**推送前验证：** `git diff --check` 通过；`node scripts/check-baseline.mjs` **179/0**；E01 Edge／Chrome／Firefox 各 **48/0**；E03 各 **18/0**；E04 各 **20/0**；Narrative **24/0**；paper texture **168/0**；构建脚本生成 **36 个文件**。

**公开验收：** `node scripts/check-baseline.mjs --public` 为 Edge 153／Chrome 153／Firefox 155 共 **18 项通过、0 失败**，报告保存在 [public-checks.json](evidence/baseline/public-checks.json)。首页、Blog、About、五篇文章页均返回 200；`posts/attention-intuition.html`、`posts/dom-search-notes.html`、`posts/paper-reading-notes.html` 与 `assets/images/search-flow.svg` 均返回 404。公开搜索、分类筛选、`ai/coding/research` 旧分类映射、主题持久化、深链接、键盘路径和无脚本降级均通过；三浏览器无未捕获 JavaScript 异常。

**环境说明：** 首次公开检查在本机遇到 Playwright Firefox 的 Windows `spawn UNKNOWN`／`mozglue` 激活上下文错误，属于用户目录中的浏览器安装环境问题，不是页面失败。将验证浏览器放到被忽略的 `.tmp-browser/browsers/` 后，同一公开检查以 `18/0` 通过。

**未验证项：** 实体手机、屏幕阅读器、真实浏览器 UI 缩放与 VC2；E05/E06 未实现。本记录将作为 docs-only 收尾提交推送，线上 `source_commit` 随后对应该收尾提交，但网站运行文件与已验证的 `44cad1c` 相同。

## 两篇 skill 设计文章替换旧示例 · 2026-09-18

**范围：** 永久删除 `posts/attention-intuition.html`、`posts/dom-search-notes.html`、`posts/paper-reading-notes.html` 与 `assets/images/search-flow.svg`；新增 `posts/ncs-figure-design.html`、`posts/research-reading.html`；同步首页、Blog、数据、相邻导航、当前文档和仍需执行的验收 harness。历史证据和归档截图不改写。

**内容结果：** 当前为八页、五篇文章，分类统计 `study` 3／`life` 1／`favorites` 1。最终顺序为 `ncs-figure-design`、`research-reading`、`deskmate-with-firefly`、`leave-some-space`、`scrna-grn-notes`，对应 `A-01` 至 `A-05`。首页最近三篇为前两篇新文与 `deskmate-with-firefly`；Blog 静态索引与脚本排序一致。两篇新文均为纯文字、五部分长文，正文约 1540 个中文字，日期 `2026-09-18`，阅读时间 4 分钟。旧三篇 URL 未保留兼容页或重定向。

**命令与结果：**

| 命令 | 结果 |
|---|---|
| `node scripts/check-baseline.mjs` | **179 项通过、0 失败**；覆盖五篇文章页、总数 5、学业 3、首页最近文章、相邻导航、搜索、深链接、旧分类映射和响应式核心检查 |
| `node docs/evidence/e01/illustration-checks.mjs --browser=edge,chrome,firefox` | Edge／Chrome／Firefox 各 **48 项通过、0 失败**；当前文章页列表与 `A-01`…`A-05` 断言通过 |
| `node docs/evidence/e03/reading-checks.mjs --browser=edge,chrome,firefox` | Edge／Chrome／Firefox 各 **18 项通过、0 失败**；代表页 `posts/ncs-figure-design.html` 的阅读进度、返回顶部、无脚本与子目录检查通过 |
| `node docs/evidence/e04/menu-checks.mjs --browser=edge,chrome,firefox` | Edge／Chrome／Firefox 各 **20 项通过、0 失败**；代表页的快捷菜单、复制链接、搜索、键盘与降级检查通过 |
| `node docs/evidence/visual/narrative-checks.mjs` | **24 项通过、0 失败** |
| `node docs/evidence/visual/paper-texture-checks.mjs` | **168 项通过、0 失败** |
| `bash scripts/build-site.sh` | 成功生成 **36 个文件** |

**发布产物：** `dist/posts/` 含两篇新文和其余三篇保留文章，不含三篇旧文；`dist/` 不含 `search-flow.svg`。当前运行时、索引和仍需执行的 harness 中未发现三个旧 slug。

**未执行项：** 实体手机、屏幕阅读器、真实浏览器 UI 缩放、公开部署核验与 VC2。本轮只记录本地自动化结果，不宣告 E06 或公开版本通过。

## 「我喜欢的」首篇文章《和流萤做同桌》 · 2026-09-18

**范围：** 新增一篇文章、两张配图，以及一处经实测判定为等价的图片 CSS；同时把几处「把篇数写死在文案里」的说法改成不会随篇数失效的写法。历史 `docs/evidence/**` 不改写。

**内容：** `posts/deskmate-with-firefly.html`，分类 `favorites`（我喜欢的），日期 `2026-09-18`，阅读时间约 1 分钟。正文四行按用户文案原样保留——`<br>` 断行、「[练剑.jpg]」「(〃∇〃)」等原始字符都未改写；两张配图放在正文之后，各带一句说明性 `figcaption`，`alt` 描述照片中实际可见的内容（发型发色、服装、手中的花束与公文包、过膝袜与底座字样）。文章不是示例，因此没有 `.post-demo-note`，列表元信息也不追加「· 示例」。

**资产（原字节复制，未重编码）：**

| 文件 | 尺寸 | 字节 | SHA256（与来源一致） |
|---|---|---:|---|
| `assets/images/deskmate-firefly-01.jpg` | 747×640 | 76,397 | `843a82fe6793c56074d968c36b07ea6c3d31b660a3950bc94b1c7b22624cf05f` |
| `assets/images/deskmate-firefly-02.jpg` | 640×944 | 87,845 | `5de3f44278ba8cb73a841a71aa22e6e503f2184d33be4e078dfab9b5a79aa906` |

相机水印（REDMI K70、48mm f/1.6、拍摄日期与 GPS 坐标）完整保留：用户在「裁掉水印条」与「保留原图不动」之间明确选择了后者。因此公开页面上会出现 `26°24'12"N 112°50'53"E`。

**编号与排序：** 本篇日期为全站最新，排在列表首位；同日另有 `ncs-figure-design`（id 1）与 `research-reading`（id 2），按「同日 id 升序」本篇列第三，最终档案编号 **A-03**。Blog 静态索引、首页最近文章、文章页编号与相邻导航均由同一顺序推导。

**CSS 对照实测（`.post-figure img` 增加 `height: auto`）：**

| 引擎 | 视口 | 保留 `height: auto` | 运行时删除 `height` 声明 |
|---|---:|---|---|
| Edge 153.0.4234.32 | 1440 / 390 | 740×634、740×1092 / 358×307、358×528 | 完全相同 |
| Chrome 153.0.8010.52 | 1440 / 390 | 同上 | 完全相同 |
| Firefox 155.0 | 1440 / 390 | 同上 | 完全相同 |

渲染宽高比 1.1672（747:640）与 0.6780（640:944）与源图四位小数一致。结论：**这条声明是等价改动，不是缺陷修复**——三个引擎都从 `img` 的 `width`／`height` 属性推导宽高比，属性提示不会把高度钉死。保留它只是把响应式图片的意图写进规则本身，不依赖属性提示。此前「竖幅照片会被拉变形」的判断是未经实测的推断，已被本对照推翻。

**验证命令与结果：**

- `node .tmp-post-geometry.mjs`（临时脚本，已删除）：1440／768／390 下阅读列 740／720／358px，两张配图按固有比例缩放，`documentElement.scrollWidth` 等于视口宽，无 `pageerror`、无 4xx。
- `node scripts/check-baseline.mjs`：**179/0**（Edge 153／Chrome 153／Firefox 155）。
- `node docs/evidence/e01/illustration-checks.mjs`：三浏览器各 **48/0**。
- `node docs/evidence/e03/reading-checks.mjs`：三浏览器各 **18/0**。首次运行在本机遇到一次已知的 Windows 文件占用偶发错误（`UNKNOWN: unknown error, open 'e03-cmp-blog-390-light.png'`，仓库注释记录约 0.6% 概率），原样重跑即通过；该项断言未放宽。
- `node docs/evidence/e04/menu-checks.mjs`：三浏览器各 **20/0**。
- `node docs/evidence/visual/narrative-checks.mjs`：**24/0**；`paper-texture-checks.mjs`：**168/0**（其中 Blog 与 post 的文档高度按「五篇列表 + 新代表文章」有意重锚，检查项已注明）。

**测试夹具的一处加固（非产品改动）：** `scripts/check-baseline.mjs` 在首个交互前等待 `.blog-filters` 的入场过渡结束。`js/motion.js` 会给该容器补 `opacity/translateY(12px)` 过渡，而 Playwright 的「visible」不排除 `opacity: 0`，首次点击可能落在仍在位移的按钮上——2026-09-18 在 Firefox 上实测到一次 `5 !== 3` 的偶发失败。加固只增加等待，未放宽任何断言。

**已知限制：** 未使用实体手机与屏幕阅读器，移动端为视口模拟；配图是手机拍摄，最长边 944px，在 1440px 视口下以阅读列宽 740px 显示，没有更高分辨率版本；观感类判据留给 E06 的 VC2。

## 文档发布的测试样例文章 · 2026-09-18

**范围：** 把 `六月.docx` 作为一篇文章发布，并标注为测试样例。运行时改动为 `posts/scrna-grn-notes.html`（新增）、`js/posts-data.js`、`js/site.js`、`blog.html`、`index.html`、`posts/leave-some-space.html`。

**契约变更：** 文章数据新增可选 `isTestSample`（boolean）。`Sywen.createPostEntry` 在条目 meta 追加 `· 测试样例`；文章页复用既有 `.post-demo-note` 显示「测试样例 · 用于验证文档发布流程」。无 id、类名、`data-*` 或路径重命名，`docs/agent-handoffs.md`、`Plan.md`、`PROJECT_PLAN.html` §19.2 已登记。

**编号影响：** 新文日期为 `2025-06-27`（docx 创建日，呼应「六月」），在「日期倒序、同日 id 升序」中位于最末，登记时未触碰既有编号。同一工作区的并行内容调整随后撤下三篇示例文并新增两篇，本站现为五篇，新文编号为 `A-05`；`post-header__index`、`post-rail__number`、Blog 静态索引、相邻文章链接与首页分类计数均已与该顺序一致。

**定向验证（Chromium/Edge，本地 HTTP；脚本为本次一次性检查，不入库）：**

| 项 | 结果 |
|---|---|
| Blog 动态列表编号 | `A-01`…`A-05`；测试样例条目 meta 为「/ 8 分钟 · 测试样例」 |
| Blog 无脚本静态列表 | `A-01`…`A-05`，测试样例条目为 `A-05`，可见链接数与条目数一致 |
| 文章页结构 | `h1` 唯一且为《六月：单细胞与基因调控网络笔记》；`post-header__index` = `post-rail__number` = `A-05`；正文 14 个 `h2[data-rail]`、12 个 `h3` |
| 标注 | 文章页 `.post-demo-note` 以「测试样例」开头 |
| 布局 | 1440 与 390 均无横向溢出；无 4xx 资源、无未捕获脚本异常 |
| 首页计数 | `data-category-count` 为 3／1／1，与 `Sywen.posts` 实际分组一致 |
| 静态结构自检 | 新页标签配对、唯一 `h1`、无重复 id、八个增强控件挂载点齐全、全部内部链接目标存在（`node --check` 级以外的独立脚本） |
| 本地构建 | `bash scripts/build-site.sh` → `[build] done: 38 files in dist/`，`dist/posts/scrna-grn-notes.html` 存在；docx 原件未被复制进仓库或 `dist/` |

**未完成／不做：** 完整的 `scripts/check-baseline.mjs`、E01／E03／E04 套件由同一工作区的并行会话在其内容调整后重跑，本次未据其输出宣告通过；未做 git 提交与推送；VC2 仍属 E06，本条目不宣告 VC2。真实手机与屏幕阅读器未测（沿用既有局限）。

## 冷灰素描纸纸齿强度修复 · 2026-09-18

**问题：** 颜色正确，但"纸张的纹理感不够强"。此前已实现 grain 层，观感却仍像平色块。

**根因（像素实测，非推断）：** 纹理存在的三个独立缺陷叠加。

1. **强度低于可感知下限。** `html::after` 为 `opacity: 0.015`，实测 1–8px 带内亮度标准差仅 **0.494**——8bit 下要相邻像素差满 1 级才可见，0.494 意味着大量相邻像素取整到同一值，纹理在数学上不可见。
2. **被 `cover` 放大抹平。** `background-size: cover` 把 512px 瓦片拉到约 2.8× 视口宽度（1440px 下约 1.4× 线性放大），细颗粒被插值糊掉。同一 opacity 改为 1:1 平铺后，高频振幅从 0.665 升到 1.388。
3. **纸面容器把 grain 完全挡住。** `.paper-panel`／`.note-panel`／`.art-frame` 等使用不透明 `--color-surface` 实色，而 grain 只存在于最底层 `html::after`，因此**凡是有内容的地方一点纸纹都没有**。

**顺带排除的两条错误路径（均已实测，不要再走）：**

- `mix-blend-mode: overlay / soft-light` 作用在 `html::after` 上**完全无效**：该层的混合背景是画布白底而非 html 背景，实测 grain 振幅恒为 **0.000**。
- `background-blend-mode` 放在 `html` 上会让整页均值偏移 **−21 ~ −94** 亮度单位（画布背景传播因子被去掉），不可用。

**实现：**

- **grain 配方改为"把浓淡烘进 SVG alpha"**：`feColorMatrix type='matrix'`，前三行输出恒定 45% 灰、第 4 行为 `alpha = 0.16 × 湍流 alpha`。这样一层 `background-image` 自带强度，因此**不需要元素 opacity，也不需要任何混合模式**，元素的 `background-color` 照常保留、子内容天然绘制在其上方（不需要额外 z-index）。
- **颜色矩阵必须整体 URL 编码**：`values='…'` 里的空格需写成 `%20`，否则 Firefox 完全不渲染（实测 sd 0.000）。同时注意到**滤镜默认 linearRGB 插值比 `sRGB` 强约 2 倍**，两套参数不可互换。
- **1:1 平铺取代 cover**：`--paper-grain-size: 256px 256px` + `repeat`。`stitchTiles='stitch'` 实测有效（1024×768 场地上接缝列 z ≈ **−2.0**，比内部更平滑，行列均无接缝）。历史上"周期性条纹"的成因是 `linear-gradient` + `160px` 固定瓦片，**不是平铺本身**。
- **纸面容器加纸齿**：`.paper-panel`／`.paper-slip`／`.note-panel`／`.art-frame` 共用一条规则加 `background-image: var(--paper-grain-layer)`；`.paper-panel--dots` 显式把 grain 串在网点层之前。**不能用元素 opacity**：那会把整张卡片连底色一起变透明，卡片被后面的纸色透出，实测造成约 −14 的亮度漂移。
- **强度实测选取**：从 0.06 起逐级上调，1–8px 带内标准差 0.06≈0.56、0.09≈0.91、0.12≈0.96、**0.16≈1.11**；门槛 1.0（8bit 下相邻像素差满一级），故取首个越过的档位 **0.16**。
- **亮度补偿（token 反解）**：grain 只能压暗，视口底纸实测被压暗约 4.2 个亮度单位。浅色 token 据此提亮为 `--color-paper: #F6F8FA`、`--color-surface: #FFFEFB`、`--color-subtle: #F1EFEA`、`--color-note: #EDEAE5`。**这些是合成前的底色、比最终显示略亮**，渲染后与确认值每通道差 < 0.5；两者必须同步改动。
- **深色主题**：lighting 仍为 `none`，但不再关闭 grain，改为中性灰 + 更低强度（alpha 0.1），避免浅色有纸感而深色完全平坦。`DESIGN_SPEC.md` §3 已同步改写。

**验收（`node docs/evidence/visual/paper-texture-checks.mjs`，168/0）：**

| 项 | 结果 |
|---|---|
| 纸齿可感知（band-passed rms ≥ 1.0） | **1.230**（修复前 0.494） |
| 形态为纤维而非云斑（\|lag1\| ≤ 0.3、lag2 < 0.5） | −0.073 / −0.001，**PASS** |
| 渲染后纸色保持已确认值 | `rgb(240.79, 242.56, 244.06)` vs `rgb(241, 243, 245)`，**差值 < 0.5** |
| 平铺无接缝（1024×768，接缝列 \|z\|） | 2.0（优于阈值 4） |
| 对比度不回退 | 正文 13.0:1、静音文字 5.8:1（门槛 4.5:1） |
| 计算样式契约 | Light `repeat` / `256px 256px` / opacity `1`；Dark 同样带 grain |

**回归：** `node scripts/check-baseline.mjs` 161/0（见下）。Light/Dark × Home/Blog/About/Article × 390/768/1024/1440 共 32 场景无横向溢出，文档高度与基线一致（补偿未改变布局）。

**已知限制：** grain 只作用于页面底纸与纸面容器，不铺进正文段落；因此长文正文列仍保持 `DESIGN_SPEC.md` §4 要求的"无背景纹理"。

**执行中发现的既有缺陷（已修）：`css/base.css` 中文注释乱码。** 该文件的中文注释曾被以 UTF-8 写入、再被按 CP936/GBK 读回并以 UTF-8 重写（字节证据：em dash `—` 的 UTF-8 序列 `E2 80 94` 在文件里是 `E9 88 A5 3F`），且经过两轮，属**双重 mojibake**。自动可逆修复不可行：解码后残留 `U+E74E` 等 PUA 码位，GBK 的 encoder 无法回写（Node 的 ICU 只提供完整 GBK *decoder*），强制往返会引入 108 个 `U+FFFD`，比原损坏更糟。

处理方式：逐行重建 65 行受损中文注释，**CSS 代码逐字保留**（受损范围经检查为 0 行代码，全部在注释内）。复验 `paper-texture-checks` 168/0 且 grain 像素数值与修复前完全一致（`rms=1.2297`、`rgb(240.79, 242.56, 244.06)`），证明功能等价。文件行尾同时统一为 LF（原文件为 538 行 CRLF + 17 行裸 LF 的混合）。

**教训（写入本记录以约束后续操作）：** 不要用 PowerShell 的 `Get-Content -Raw` / `Set-Content` / `[System.IO.File]::WriteAllText` 改带中文的源码文件——Windows PowerShell 5.1 默认按系统 ANSI 代码页（本机 CP936）读写，会损坏 UTF-8 中文。批量文本替换应使用 Node/Python 并显式指定 UTF-8，或直接用文件编辑工具。

## 冷灰素描纸纹理层 · 2026-09-18

**范围：** 只调整全局纸面材质层；保留 `--color-paper: #F1F3F5`，未修改 HTML 结构、页面布局、交互、动效、JavaScript、panel/card/note/article surface 配色或局部装饰网点。

**实现：** `css/base.css` 使用两个固定 CSS overlay。`html::before` 提供 `radial-gradient` tonal variation（白色 alpha `0.06`，非周期、无 linear/repeating gradient）；`html::after` 提供 inline SVG 灰度 grain，`position: fixed; inset: 0; background-repeat: no-repeat; background-size: cover; pointer-events: none; opacity: 0.015`。SVG 参数为 `fractalNoise`、`baseFrequency=.85`、`numOctaves=2`、`seed=21`、`stitchTiles=stitch`，并通过 `feColorMatrix` 去色。

**主题隔离：** Light 使用 `#F1F3F5` 与两层纸面材质；显式 Dark 和系统暗色均将 tonal/grain image 设为 `none`、grain opacity 设为 `0`，不继承浅色 overlay。`body` 保持透明并位于 overlay 之上，纹理不覆盖正文命中层。

**专项检查：** `node docs/evidence/visual/paper-texture-checks.mjs` — **164/0**。覆盖 Light/Dark、Home/Blog/About/Article、390/768/1024/1440px；计算样式确认 Light 主色、grain opacity、fixed/no-repeat/cover/pointer-events、Dark 隔离；页面无横向溢出，文章列宽与既有文档高度保持一致。

**截图矩阵：** `docs/evidence/visual/capture.mjs` 生成 32 张截图，证据见 [`docs/evidence/visual/paper-texture/final/`](evidence/visual/paper-texture/final/)，所有场景 `overflow=false`。重点人工查看 [`Home 1440 Light`](evidence/visual/paper-texture/final/home-1440-light.png)、[`Article 1440 Light`](evidence/visual/paper-texture/final/post-1440-light.png) 与 Home 1440 Dark：宏观平坦、无条纹/网格/seam，正文、卡片和人物线稿清晰；未发现需要下一轮微调的问题。

**回归：** `node scripts/check-baseline.mjs` 使用工作区 Firefox 浏览器路径运行，**161/0**；`node docs/evidence/visual/narrative-checks.mjs`，**24/0**。首次未设置 Firefox 工作区路径时出现环境级 `spawn UNKNOWN`，未进入页面检查，随后按既有仓库方法重跑通过。

## 清理运行时暖黄色残留 · 2026-09-18

**根因：** 当时全局 `--color-paper` 为 `#F2F0EC`，但 `css/pages.css` 的 `.about-decoration` 仍硬编码 `background: #f7f3ea`，会在 About 页面形成独立暖黄色纸片；规格页 `PROJECT_PLAN.html` 也保留了旧的内联暖色 token。

**修复：** `.about-decoration` 改用 `var(--color-paper)`；同时将 `PROJECT_PLAN.html` 的独立预览 token 同步为冷白 paper、surface、graphite ink、muted、rule 与灰纸签色。未修改插画资产自身的白色纸面、页面布局或交互。

**静态检查：** `css/` 中旧暖黄色值 `#f7f3ea`、`#fffcf5`、`#f0e1ac` 搜索结果为 0。当前颜色微调后的浏览器 computed-style 应为 `rgb(242, 242, 239)`，三页横向溢出均为 0。

**视觉复核：** 重新生成 Home/Blog/About/Article × 1440/390 × Light/Dark 共 16 张截图，证据见 `docs/evidence/visual/cold-paper-residual-fix/after/`；About 1440px 人工查看通过。

**纸面微调：** 浅色主纸面进一步调整为 `#F2F2EF`，保持现有 surface、note、grain 和 Dark Theme 不变。

**再次试色：** 浅色主纸面改试为 `#F7F7F5`，保持其余纸面层级与纹理参数不变。

**当前试色：** 浅色主纸面改试为 `#F1F3F5`，保持其余纸面层级与纹理参数不变。

## 冷白纸纹理针对性修复 · 2026-09-18

**问题来源：** 原实现的 `--paper-lighting` 同时叠加了 `linear-gradient(180deg, ...)`，造成整页方向性明暗带；`--paper-grain` 又使用 `160px 160px` 固定背景尺寸并重复平铺，放大了周期性 seam。两者共同产生截图中的横向条纹/栅格感。

**修复：** 删除全局线性渐变；保留一处大尺度、非周期性的 radial lighting。SVG grain 改为 `512×512` 的 `feTurbulence`（`numOctaves=3`、灰度、约 `0.025` alpha），背景禁止重复并使用 `cover`，不再使用 CSS repeating gradient 或固定小瓦片。Panel、Note、Ink 层级未重新设计。

**视觉复核：** 重新捕获 Home、About、Article 的 1440px 浅色截图与 Home 390px 浅色截图，并同步生成两主题 16 张矩阵，证据见 `docs/evidence/visual/cold-paper-fix/after/`。人工检查确认无明显横向条纹、纵向条纹、网格或固定周期结构；页面宏观连续冷白，随机 grain 不干扰长文阅读，人物线稿保持清晰。

## 冷白素描纸主题升级 · 2026-09-18

**范围：** 仅升级浅色纸面 token、静态纸纹与共享 surface 层级；未修改页面结构、内容、插画、导航、数据逻辑、主题 JS 或交互。

|检查|结果与证据|
|---|---|
|浅色主题 token|`--color-paper: #F2F2EF`、`--color-surface: #FAF9F6`、`--color-subtle: #ECEAE5`、`--color-ink: #272522`、`--color-muted: #5E5A54`、`--color-rule: #CFCCC5`、`--color-note: #E8E6E0`|
|Paper Grain|`css/base.css` 使用 CSS lighting + 内联 SVG `feTurbulence`；noise alpha 约 0.04，静态、无布局、无 JS、无新增图片或依赖，`pointer-events` 不参与交互|
|Dark Theme|`data-theme="dark"` 与系统暗色均使用 `background-image: none`；computed-style probe 实测 `#202223` 且无浅色纹理泄漏|
|Surface 层级|Background → `surface` panel → `subtle` detail；局部 halftone 保留并降低为石墨混合色；Article 正文未新增独立纹理层|
|Baseline|`node scripts/check-baseline.mjs`：**161/0**|
|Narrative 与视觉矩阵|`node docs/evidence/visual/narrative-checks.mjs`：**24/0**；`capture.mjs`：Home/Blog/About/Article × 1440/1200/1024/768/390 × Light/Dark，共 **40 张**，全部 `overflow=false`，证据见 `docs/evidence/visual/cold-paper/`|
|T04 渲染测量|主要场景完成：横向溢出 0，Post 正文/头部 ≥1024px 均 740px；Light 对比度 body 13.43:1、muted 6.02:1、panel 14.52:1。旧 harness 随后在现有页面缺少 `.category-button` 的组件状态探针处中止，属于验证脚本与当前契约不一致，非页面渲染错误|
|人工视觉检查|已查看 1440px Home/Article、390px Home、1440px Dark Home：暖黄色消失，纸面保持冷白灰，grain 几乎不可见，长文可读，人物线稿清晰，Header/Footer 连续|

**已知限制：** 旧 `docs/evidence/t04/audit.mjs` 仍包含历史 T04 的脚本、资源标记和断点假设，因此会报告与当前仓库状态无关的旧契约失败；本轮新增的 token 与浅深纹理断言已通过。分类插画自身的白色画布未修改，属于既有资产纸面而非页面背景。

## 视觉架构重构 · Narrative Layer Visual Vertical Slice · 2026-09-18

**本地验收；样板只覆盖用户确认区域，正式 VC2 与全域扩展留 Phase 4／5 与 E06。** 契约见 [视觉架构契约](visual-architecture.md)，证据见 [evidence/visual](evidence/visual/README.md)，观感结论见 visual-review 同名条目。

|检查|结果与证据|
|---|---|
|Narrative 契约|22/0：`docs/evidence/visual/narrative-checks.mjs`。逐元素验证 `aria-hidden` 祖先、不可聚焦、不含可聚焦元素、`pointer-events` 解析为 `none`、不与交互元素重叠|
|Article 阅读列|Post 页 Narrative 元素全部位于 740px 阅读列之外（bounding box 断言，属于同一 22 项）|
|Blog 新契约|列表 `img` 0 张、条目 4 条、计数「找到 4 篇文章」；`life` 筛选 1 条且编号仍为 `A-04`（编号跟随文章）；重置回 4 条；无脚本静态列表 4 条、0 图、4 个可见链接|
|截图矩阵|1440／1200／1024／768／390 × 浅深 × 4 类页面 = 40 张，`reference/`（改动前）与 `after/` 对照，全部 `overflow=false`；`capture.mjs` 可再生|
|基线|`node scripts/check-baseline.mjs`：161/0，Edge／Chrome／Firefox|
|E01|Firefox 48/0。断言已更新到新契约：Blog 无缩略图、编号 `A-01`…`A-04`、首页分类入口改用 `.category-link--{study,life,favorites}` 并断言 `C-01`…`C-03`|
|E03|Firefox 18/0。第 12 项由「无脚本页脚留白 32px」改为 64px，对应页脚升级为视觉收束点后的新基线|
|E04|Firefox 20/0|

过程中修复：手写字体栈使中文旁白落到细衬线，后按用户 2026-09-18 反馈**彻底取消手写体**，旁注改用正文字体 + 静音色 + 短 mark 线；390px 首页 8px 横向溢出（植物跨出纸片边界，手机与平板改为面板内落点）；首页档案编号未渲染、以及编号跟随筛选结果而非文章本身。

**未验证**：实体手机、屏幕阅读器、真实浏览器 UI 缩放；`page-rail` 的固定 1200px 断点仍为原型，待用户视觉审核确认。未推送、未部署。

## E02 About 与转场 · 2026-09-17

**本地验收；正式 VC2 与公开发布留 E06。** A02 采用候选 3，A07 铃兰 v04、A08 横枝 v01；实际看图结论见 visual-review 的 E02 条目。代码与资产基于 `7e7c1c9` 工作区，原有豆包日志和脚本保留。

|检查|结果与证据|
|---|---|
|同视口视觉|重新捕获 1440×900／390×900 浅深 before/after，四组实际看图通过；`evidence/e02/`|
|E02 专项|18/0：320/390/768/1023/1024/1440 浅深、完整比例、不反色不降透明度、装饰不遮文字/不可聚焦；图片失败、无脚本及两者组合、子目录、存储失败、键盘入口、DPR2请求与失败占位|
|资源预算|A02 26786/83194 bytes ≤200000；A07 14930、A08 14476 bytes ≤25000；清单 `about-assets.json`|
|基线|`node scripts/check-baseline.mjs`：161/0，Edge／Chrome／Firefox；含主题持久化、搜索分类、键盘、减少动态效果与降级|
|E03|三浏览器各18/0；首轮 Edge/Chrome 因旧快照中豆包原路径缺失而失败，现改为验证迁移目标与原 SHA256，未豁免内容变化|
|构建与文字|`bash scripts/build-site.sh` 成功，dist 31 文件，无母版/候选/参考；正式导出哈希一致，About HTML 文本内容与修改前完全相同；`evidence/e02/build-checks.json`|

E04 初轮 Chrome 18/1（Edge/Firefox 19/0），独立上下文截图在 Blog 缩略图区域出现像素差异；首次报告保留于 `evidence/e02/menu-chrome-first-run.json`。调整为同一页面先解码图片再切换按钮，保持正文零像素差断言；最终 Edge／Chrome／Firefox 各 20/0（含新增竞态回归）。

E04 Chrome 连续复现既有竞态：键盘打开后立即 Esc，尚未运行的 setTimeout 回调重新打开菜单。最小修复将 deferredActivate 提升为模块状态，并在 closeMenu 时取消；新增第20项同一任务内打开/Esc、等待回调后仍关闭的检查。E01 的既有三浏览器 49/0 报告保留；本次共享菜单修复由 E04 20/0 与 baseline 161/0 覆盖，未把一次挂起的 E01 重跑冒充通过。无脚本且图片失败时保留原生 alt/破图占位，正文导航可用。未验证：实体手机、真实浏览器 UI 200% 缩放、屏幕阅读器、真实混合输入设备。豆包逐次完整提示词与工具回执待补；已回传图像可本地采用。没有推送、部署或公开版本核验。

## 分类调整回归 · 2026-09-16

**结论：本地通过。** 一级分类已收敛为「学业／生活／我喜欢的」；`study` 包含注意力机制、JavaScript 搜索、论文阅读三篇，`life` 包含生活随笔，`favorites` 当前为 0 篇。既有文章地址、日期、排序与标签保持不变。

**交互契约**：Blog 按钮顺序为「全部／学业／生活／我喜欢的」，首页计数为 **3／1／0**。选择“我喜欢的”且没有关键词时，空状态显示「这里还没有文章」及「之后在这里记录喜欢的美食、游戏、动漫，还有一些杂谈。」；带关键词的 0 结果仍显示通用搜索提示。旧 `ai`、`coding`、`research` 查询参数均映射为 `study` 并规范化到新地址，未知分类仍回到全部，`q` 参数保留。

**回归命令**：`$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.tmp-browser/browsers'; node scripts/check-baseline.mjs`

**实际结果**：Edge 153、Chrome 152、Firefox 155 共 **161 项通过、0 失败**；覆盖首页计数、四篇总列表、三类筛选、关键词组合、刷新／前进后退、旧参数兼容、无脚本静态索引、脚本失败降级、子目录、明暗主题、键盘、响应式与减少动态效果。最新截图与报告见 [baseline 证据](evidence/baseline/)，新增 `blog-favorites-empty-390-dark.png`。

**范围说明**：本轮仅更新本地源码与验收证据，未推送 Gitee、未重新部署 Cloudflare；公开站点仍是现有部署版本，发布与线上验收沿用 E06 流程。历史 T/B/E 验收章节保留原记录。

## E01 · 文章小画体系 · 2026-09-16

**结论：本地通过。** study/life/favorites 三张无人物分类小画已产出并融合到首页分类入口卡与 Blog 文章条目缩略图，首页「最近文章」保持纯文字；不破坏基线内容、键盘、主题、路径与既有功能。VC2 正式判定与线上发布属于 E06，本记录不替代它们，且本轮**未推送 Gitee、未部署 Cloudflare**。

**美术（用户逐张确认）**：以 Hero J 书桌成图为画风/暖纸参考，用 Seedream 5.0 Pro 的图生图延续漫画线稿语言，4:3 母版 2364×1773（存于 gitignored 的 `art-work/categories/`，不发布）。study 为 2–3 本叠放的书＋书签＋合上的笔记本电脑（candidate-3；candidate-2 因电脑被裁切否决），life 为摊开的手账本＋斜搭的笔＋冒热气的咖啡（candidate-1），favorites 为单盆居中向日葵盆栽（candidate-2；含红色耳机与杨枝甘露的 candidate-1 被用户判定「违和感太强」后移除）。study/life 纯墨线＋暖纸、不上红、仅极淡蓝点缀；favorites 向日葵克制上色。三张均无人物、无文字。

**确定性导出**：`scripts/export-category-art.py` 用 Pillow Lanczos 等比缩放到 640×480、WebP q88 method 6、不写元数据，校验精确 4:3 与单文件 ≤40KB，并生成清单 `docs/category-assets.json`。产物 `cat-study.webp` 18406B、`cat-life.webp` 18234B、`cat-favorites.webp` 29072B（SHA256 见清单）。

**融合契约**：分类对象新增 `image`（站点根相对路径）；`Sywen.createPostEntry(post, headingLevel, options)` 新增第三参，仅 `js/blog.js` 动态列表传 `{thumbnail:true}`，首页「最近文章」仍调用两参版本保持纯文字；Blog 无脚本静态列表四条均补缩略图（study×3、life×1）。缩略图为 `span.art-frame.art-frame--thumb.post-entry__thumb[aria-hidden="true"]` 内的 `img.art-frame__image`，`alt=""`、`width/height=640/480`、`loading="lazy"`、`decoding="async"`；首页分类入口为 `a.category-link.category-link--card`（图框 `.category-link__art.art-frame.art-frame--category`＋文本 `.category-link__body`），手机横卡、≥768px 三列上图下文。图框 1px 规则色边框、暖纸底、`object-fit:cover`；图片失败时 `.is-failed` 收起图框，文字链接与计数完整。

**E01 证据**：`node docs/evidence/e01/illustration-checks.mjs`（Edge 153／Chrome 152／Firefox 155）三浏览器各 **49 项通过、0 失败**（报告 [illustration-report.txt](evidence/e01/illustration-report.txt)，逐浏览器 JSON 与 6 张桌面/手机/深色/失败态/无脚本截图同目录）。覆盖资产格式/尺寸/字节/sha、动态与静态缩略的分类映射、桌面 128×96 与手机 80×60、首页手机 96×72 与桌面通宽 4:3、装饰图不可聚焦且 alt 为空、懒加载、失败收起、无脚本、子目录、浅深色与 320–1440px 溢出矩阵。

**全量基线回归**：`node scripts/check-baseline.mjs` 在 E01 构建上重跑为 **161 项通过、0 失败**（`docs/evidence/baseline/checks.json`，baseline 截图随之刷新为 E01 后状态）。

**E03/E04 回归与证据脚本的最小兼容更新**（不改产品行为，沿用 E04 当年最小更新 E03 的先例）：
- E03 `reading-checks.mjs` 第 18 项原与 B05 博客列表像素基线逐像素对照；E01 有意重排博客列表并增高页面，旧基线失效。改为与 E01 后基线 `docs/evidence/e01/references/blog-{1440-light,1440-dark,390-light}.png`（Chromium 整页截图、截图前强制懒加载就位）对照，仍要求同尺寸、忽略页头带后页脚 64px 之外 **0 差异**；390px 档沿用 E04 起的记录项处理；Firefox 仍跳过像素项。另修复第 8 项一处测试时序竞态：键盘返回顶部在瞬时跳转后立即聚焦按钮，可能命中仍 `visibility:hidden` 的按钮导致 Enter 落空，现先等 `is-visible` 生效再聚焦（与真实 Tab 顺序一致，断言强度不变）。结果三浏览器各 **18/0**。
- E04 `menu-checks.mjs` 第 19 项「显示/隐藏快捷菜单按钮零布局位移」原把视口高度写死为旧文档高度（1440/1903）；改为先实测当前博客文档高度再对齐，并在截图前稳定懒加载，严格的「忽略页头带外 0 差异」守卫不变。结果三浏览器各 **19/0**（首轮在高负载下 Chrome 第 8 项「滚动关闭菜单」曾超时一次，隔离复跑未复现，判定为环境抖动）。

**未验证项/已知限制**：640px 源图在桌面首页卡（约 365 CSS px、DPR2 约 730px）有轻微放大，线稿观感可接受；真实手机、浏览器 UI 缩放与屏幕阅读器未测（沿用既有 OB-03，移动端为视口模拟）；VC2、Gitee 推送与 Cloudflare 部署留 E06。

## E04 · 复制与快捷菜单 · 2026-09-16

**结论：本地通过。** 复制成功／失败两条路径、单层右键菜单的启用范围、内容、定位、关闭时机、键盘与原生菜单豁免全部符合 `PROJECT_PLAN.html` §15.1–§15.6、§16.1／§16.3／§16.4；B05 基线回归在 E04 后重跑保持 158 项通过；E03 阅读增强检查按新契约最小更新后仍全部通过。VC2 正式判定与线上发布属于 E06，本记录不替代它们。

**基线版本**：`fddead5`（E04 第一步自身提交；再往前 `c0534bd` 为 E03 收尾，与 `origin/main` 一致）。起始工作区含未提交的 Hero 线稿修订，未纳入本次改动。
**浏览器**：Edge 153.0.4234.32、Chrome 152.0.7977.83、Firefox 155.0（Playwright 1.63.0；Firefox 位于工作区忽略目录，用 `PLAYWRIGHT_BROWSERS_PATH` 指向）
**命令**：`node docs/evidence/e04/menu-checks.mjs --browser=edge,chrome,firefox`
**报告**：[Edge](evidence/e04/menu-checks-edge.json)｜[Chrome](evidence/e04/menu-checks-chrome.json)｜[Firefox](evidence/e04/menu-checks-firefox.json)｜摘要 [menu-report.txt](evidence/e04/menu-report.txt)
**截图**：`docs/evidence/e04/e04-*.png`（39 张：七页 × 1440 × 浅/深菜单打开态、七页 × 390 × 浅/深触摸态、文章页复制面板与状态提示、A/B 对照）

三浏览器各 **19 项通过、0 失败**。逐项结果：

| 检查 | 预期 | 实际 |
|---|---|---|
| 1. 七页脚本顺序与资源 | `theme → posts-data → site →（blog）→ reading → context-menu`，除主题外全 `defer`，无 404 | 七页一致，0 失败请求、0 页面异常 |
| 2. 能力门与按钮初始状态 | 桌面能力下按钮去 `hidden`，`aria-haspopup="menu"`、`aria-expanded="false"`，菜单与面板均 `hidden` | 七页全部成立 |
| 3. 反向能力门（触摸为主） | `matchMedia` 为假 → 按钮保持 `hidden`、右键不拦截原生菜单、菜单保持 `hidden` | 成立；`display: none`，右键 `defaultPrevented === false` |
| 4. 菜单内容与分组 | 3 组、7 项、项项有图标与中文文字、`tabindex="-1"`；文章页文案「返回文章列表」+「复制文章链接」+只读进度 | 七页（含文章页）全部符合 |
| 5. 按钮键盘入口与焦点恢复 | Enter 打开并聚焦首项；Esc 关闭并恢复按钮；点击路径同样开合且焦点留在按钮 | Enter/Esc 与点击两条路径均通过 |
| 6. 菜单键盘循环 | ↑↓ 循环、Home/End、Tab 关闭且不困住焦点、关闭后菜单项不可聚焦 | 覆盖全部菜单项后回到首项；Tab 后焦点离开菜单；关闭后 0 个可聚焦菜单项 |
| 7. 右键定位与视口夹取 | 四角取点＋视口内 8px、宽 224px、项高 ≥40px、再次右键不叠加实例 | 5 个取点全部在界内；宽度 224px；再次右键仅更新位置 |
| 8. 关闭时机 | 外部 `pointerdown`、Esc、页面滚动、`resize`、窗口失焦分别关闭；菜单内部滚动不关闭；外部点击不强拉焦点 | 全部成立；外部点击后焦点未被拉回 |
| 9. 原生菜单豁免 | 正文／按钮＝自定义；输入框、链接、页脚链接＝原生；Shift 右键与文本选区＝原生；`[data-menu-exempt]` 可用 | 真实右键手势下逐项一致（含事件目标归属校验） |
| 10. 复制成功路径 | 提示「链接已复制」，不打开面板；文章页复制不含查询与片段的地址 | 剪贴板实测等于 `…/posts/dom-search-notes.html`；`blog.html?q=DOM#main` 复制完整地址；提示 3s 后自动收起 |
| 11. 复制失败降级面板 | 面板显示、输入框只读且值正确、聚焦并全选、Esc 与关闭按钮均关闭并归还焦点、输入框保留原生右键 | 全部成立；两种关闭方式后焦点都回到菜单按钮 |
| 12. 无 Clipboard API | 同样进入面板 | 成立 |
| 13. `file://` 模式 | 不复制本地路径，提示「请在公开网站中复制可分享链接」并给出面板 | 成立 |
| 14. 共享动作复用 | 搜索（Blog 聚焦／其他页跳 `blog.html?focus=search`）、返回顶部（复用 `requestTop`，回顶并聚焦主标题）、主题（与 Header 同步文案与 `aria-pressed`） | 全部成立；菜单主题文案随后同步 |
| 15. 文章页只读进度 | 数值来自 `reading.js` 的当前进度，滚动后更新；滚动会关闭菜单（§15.4） | 顶部 0%、中部 50% 与 API 一致；滚动确实关闭菜单 |
| 16. 无脚本与初始化失败 | 无脚本时四个控件 `hidden` 且 `display:none`；`context-menu.js` 失败时页面其余功能与静态降级不变 | 成立；搜索仍可用、按钮不显示、0 异常 |
| 17. 子目录路径与地址 | `/course/blog/` 下菜单跳转与复制地址都在子目录内 | 跳转 `…/course/blog/index.html`；文章地址不含查询与片段 |
| 18. 布局不变量 | 390/768/1440 打开菜单无横向溢出、菜单不越界；390 触摸上下文无按钮；面板在窄视口内不越界 | 溢出 0、菜单 224px、面板 358px 全在界内 |
| 19. 截图与同视口对照 | 39 张截图；同视口 A/B（隐藏／显示按钮）除页头按钮带外逐像素一致 | 1440 与 390 两档 **差异 0**（忽略顶部 3px 进度线与页头 18–140px 工具行） |

**实际看图（本会话）**：`e04-*-1440-{light,dark}-menu.png`（七页菜单打开）、`e04-post-1440-{light,dark}-copy-panel.png`、`e04-post-1440-{light,dark}-notice.png`、`e04-*-390-{light,dark}-touch.png` 已逐张查看 —— 菜单为纸面底 + 2px 墨框 + 4px 硬阴影，宽 224px、分组细线、每项 16px 图标 + 中文，贴按钮或光标且四周留白；浅深两主题下与既有按钮族一致；文章页菜单底部显示只读「阅读进度：N%」；复制面板在 1440 与 390 都居中、输入框与「关闭」按钮有序排布、窄屏不溢出；390 触摸态页头只有主题按钮，菜单按钮不出现，页面无横向滚动。观感类结论（菜单在页头的视觉分量、面板与正文的层次关系）留给 E06 的 VC2。

**回归**：`node scripts/check-baseline.mjs`（Edge 全量 + Chrome/Firefox 核心）在 E04 后重新执行，结果为 **158 项通过、0 失败**（`docs/evidence/baseline/checks.json`）。原先「`#quick-menu-button` 始终隐藏」的断言改为能力相关等价断言（可见性＝`(hover: hover) and (pointer: fine)`，且 `aria-haspopup="menu"`、`aria-expanded="false"`、菜单初始 `hidden`），断言强度未降低；其余断言与截图参数不变。回归脚本会重写 `docs/evidence/baseline/*.png`，因此这些图片现在记录的是 E04 之后的状态（E03 时同样发生过刷新）。

**E03 证据按新契约刷新**：`docs/evidence/e03/reading-checks.mjs` 做了最小兼容更新（脚本顺序加入 `context-menu.js`；`outstandingHidden` 收敛为仍须隐藏的 `#site-notice`／`#copy-panel`／`#context-menu` 并单独校验菜单按钮语义；第 18 项忽略页头工具行、390px 档降为记录项）。重跑后三浏览器各 **18 项通过、0 失败**，`reading-checks-*.json`、`reading-report.txt` 与 12 张截图已按当前构建刷新。第 18 项 1440 两档在忽略区外差异为 0。

**与旧截图的既有差异（记录项，非 E04 回归）**：E03 冻结的 `e03-baseline-blog-1440-*` 基线本身带有全选高亮（部分链接与文字呈选区前景色，如 `#244b90`／`#4e2424`），`e03-baseline-blog-390-light` 在非页脚区域也大面积不同。复核确认这些差异在 E04 改动之前就存在（当前构建内隐藏/显示按钮的 A/B 对照只差页头按钮带），因此不改写历史证据，只记录数值供 E06 判断。

**限制**：未使用实体手机与屏幕阅读器（沿用 OB-03）；移动端为浏览器视口模拟；混合输入设备（触摸为主 + 外接鼠标）按 §15.1 的主指针判定不显示菜单按钮，未在真实混合设备上验证；观感判定不替代 E06 的 VC2。

**本机环境现象（不削弱断言）**：Firefox 不接受 Playwright 的 `clipboard-read` 权限申请，脚本自动退回「仅验证可见事实」（提示文案 + 未打开面板），报告里以 `permissionFallback` 记录；Edge／Chrome 授予权限后剪贴板内容逐字比对。本机 Firefox 在整套检查中偶发丢失鼠标点击（单独复现 12 次均正常），`clickMenuButton()` 等待 150ms 后若菜单状态未变化会补一次合成 click，报告以 `recoveredToggles` 计数（本次 Edge 1 次、Chrome 2 次、Firefox 7 次）——断言内容与判定标准未变。

**未执行**：推送、部署、VC2、E06 —— 按用户决定留待后续任务。

## E03 · 简单阅读增强（返回顶部与阅读进度）· 2026-09-16

**结论：本地通过。** 新增两个增强控件的可测量行为全部符合 `PROJECT_PLAN.html` §16.2／§16.3；B05 基线回归在 E03 后重新执行并保持通过；默认态与 B05 截图逐像素对照无基线外差异。VC2 正式判定与线上发布属于 E06，本记录不替代它们。

**基线版本**：`a0ed633`（起始工作区含未提交的 Hero 线稿修订，未纳入本次改动）
**浏览器**：Edge 153.0.4234.32、Chrome 152.0.7977.83、Firefox 155.0（Playwright 1.63.0；Firefox 位于工作区忽略目录，用 `PLAYWRIGHT_BROWSERS_PATH` 指向）
**命令**：`node docs/evidence/e03/reading-checks.mjs --browser=edge,chrome,firefox`
**报告**：[Edge](evidence/e03/reading-checks-edge.json)｜[Chrome](evidence/e03/reading-checks-chrome.json)｜[Firefox](evidence/e03/reading-checks-firefox.json)｜摘要 [reading-report.txt](evidence/e03/reading-report.txt)
**截图**：`docs/evidence/e03/e03-*.png`（12 张：1440/390 × 浅/深 × 中途/到底、无脚本两态、B05 对照 4 张）

三浏览器各 **18 项通过、0 失败**（Firefox 的第 18 项为 Chromium 专用对照，按跳过记录）。逐项结果：

| 检查 | 预期 | 实际 |
|---|---|---|
| 1. 七页脚本顺序与资源 | `theme → posts-data → site →（blog）→ reading`，除主题外 `defer`，无 404 | 七页一致，0 失败请求、0 页面异常 |
| 2. 进度元素语义 | 初始化后移除 `hidden`，`role/aria-label/min/max` 不变，其他增强控件仍 `hidden` | 全部成立；`display: block`、`height: 2px`、`position: fixed`、`pointer-events: none`；`quick-menu-button`／`site-notice`／`copy-panel`／`context-menu` 仍 `hidden` |
| 3. 进度值公式 | 顶 0%、中段＝`round(scrollTop/max×100)`、底 100%，`aria-valuenow` 同步 | 三档全部一致（取整容差 ≤1） |
| 4. 实际绘制宽度 | `scaleX` 与百分比一致，绘制像素＝轨道宽×百分比 | 25%/60%/100% 三档实测一致 |
| 5. 480px 阈值 | `scrollTop ≥ 480` 显示，之前隐藏且不可点 | 0/300/1200px 三档正确；隐藏态 `visibility: hidden`、`pointer-events: none` |
| 6. 命中区与位置 | ≥44×44，距右下各 16px | 390 与 1440 两档均为 84×44（文本宽度），右 16、下 16 |
| 7. 页尾不遮挡 | 滚到底时按钮矩形与页脚内容矩形零相交 | 4 页 × 2 视口共 8 组全部零相交，净空 ≥8px（实测 ≥20px） |
| 8. 键鼠返回顶部 | 点击与 Tab+Enter 都回到顶部并聚焦主标题 | 390/1440 两档均回到 `scrollTop 0`，焦点落在 `h1.page-title`，按钮随后隐藏 |
| 9. 减少动态效果 | 同一帧内回到顶部，`scroll-behavior` 仍为 `auto` | 通过；`Sywen.prefersReducedMotion()` 返回 `true` |
| 10. 重算 | resize 与延迟图片加载后按新尺寸重算 | 视口 900→500 后 `maxScroll` 变大且进度按新值重算；Hero 延迟 700ms 加载后仍一致 |
| 11. 深链接 | `#main` 定位下进度与位置一致 | 390×700 视口：`scrollTop 106 / max 2211 → 5%`，与公式一致 |
| 12. 无脚本 | `#reading-progress`、`#back-to-top` 保持 `hidden` 且 `display: none` | 七页全部成立；页脚留白保持基线 32px（`html.has-reading` 未加入） |
| 13. 子目录 | `/course/blog/` 下可用 | 进度与按钮正常，资源相对路径正确 |
| 14. 控制台 | 七页 0 异常、0 失败请求 | 通过 |
| 15. 200% 等效 | 720px 视口 + DPR2 无横向溢出，按钮不越界 | 三页通过 |
| 16. 资产未改动 | 除既有的两张 Hero 修订外，`assets/` 与 B05 记录哈希一致 | 全部一致，仅 `hero-desk-640/1280.webp` 保持既有的未提交修订 |
| 17. 截图归档 | — | 12 张写入 `docs/evidence/e03/` |
| 18. 与 B05 对照 | 默认态（未滚动）除顶部进度线外无差异 | Edge/Chrome 通过；Firefox 记为「跳过：基线为 Chromium 渲染，文本抗锯齿不同，逐像素对照不适用」，1–17 项照常执行 |

**第 18 项逐像素对照**（自写解码器，忽略顶部 3px 进度线；仅 Edge/Chrome，原因见上）：

| 对照 | 尺寸 | 忽略区外差异像素 |
|---|---|---|
| `baseline/blog-1440-light.png` ↔ `e03-baseline-blog-1440-light.png` | 1440×1440 | 0 |
| `baseline/blog-1440-dark.png` ↔ `e03-baseline-blog-1440-dark.png` | 1440×1440 | 0 |
| `baseline/blog-390-light.png` ↔ `e03-baseline-blog-390-light.png` | 390×1901 | 0 |

Blog 页面高度由视口决定（1440×1440 与 390×1901 下文档高度分别恰为 1440 与 1901），页脚预留空间未改变文档高度，因此除顶部进度线外应无差异 —— 实测一致。

**实际看图（本会话）**：`e03-post-1440-{light,dark}-{mid,bottom}.png` 与 `e03-post-390-{light,dark}-bottom.png` 已逐张查看 —— 桌面进度线在浅深两主题下都是贴顶 2px 墨线、长度与进度一致；右下「返回顶部」按钮为纸面底 + 2px 墨框 + 硬阴影，与既有按钮族一致；手机版页脚最后一行（版权）与按钮之间留有明显净空，未被覆盖。观感类结论（例如短页 100% 时满宽进度线的视觉分量）留给 E06 的 VC2。

**回归**：`node scripts/check-baseline.mjs`（Edge 全量 + Chrome/Firefox 核心）在 E03 后重新执行，收紧后的结果为 **158 项通过、0 失败**（`docs/evidence/baseline/checks.json`）。首次复跑时本机出现随机单张截图写入失败（`UNKNOWN: unknown error, open …png`，每次随机落在不同 PNG，页面对应的测量断言均已通过）；已在 `shot()` 中加入一次重试（不改变截图参数、不削弱断言）后稳定通过，该环境现象记入下方「已知问题」。

**B05 基线证据截图被本次回归刷新**（可复核）：回归脚本会重写 `docs/evidence/baseline/*.png`，因此这些图片现在记录的是 E03 之后的状态。逐项尺寸对照：

- 22 张有脚本截图的文档高度**恰好增加 64px**（页脚 `--footer-reserve: 32px` 在块方向上下各计入一次，32+32=64）；`home-nojs-390-dark.png` 高度**完全不变（+0）**，反向印证 `html.has-reading` 只在脚本就绪时生效。
- 新增可见内容只有贴顶 2px 进度线；其余差异是这 64px 的整体下移，不含任何文本、栅格、间距或图片改动。
- Home 相关截图中的 Hero 与提交版不同，原因是工作区存在未提交的 Hero 线稿修订（E05 式，本任务之前就存在、E03 未触碰）；E03 的证据对照使用 Blog 页面，不受该修订影响。

**限制**：未使用实体手机与屏幕阅读器（沿用 OB-03）；移动端为浏览器视口模拟；观感判定不替代 E06 的 VC2。

**未执行**：推送、部署、VC2、E06 —— 按用户决定留待后续任务。

## 当前基线验收 · 2026-09-16

B00–B06 完成，作业基线已达到。以下 T 阶段条目保留历史；当前证据以本节及 docs/evidence/baseline/ 为准。

### B06 · Passed

正式网站 https://sywen-blog.pages.dev/，源提交655e8c4已推送Gitee并由GitHub main自动部署。version.json源提交与预期一致；[线上文件核对](evidence/baseline/deployment-checks.json)25项通过，[三浏览器线上交互](evidence/baseline/public-checks.json)15项通过。七页、全部20个源码发布文件字节与Git一致；不存在的文章/资源及非发布文档返回404。Cloudflare会将.html地址规范化到无扩展名地址，深链接和相对资源照常可用。

[演示录像](evidence/baseline/baseline-demo.webm)已录制；README与[交付记录](delivery.md)包含检查入口。当前已关闭的阻塞不因后续文档提交重新打开；新部署的源版本以线上version.json为准，文档提交不改变网站运行时文件。

### B04/B05 · Passed

- 源码：e3191ba（运行时网站文件）；完整报告 [checks.json](evidence/baseline/checks.json) 保留实际运行父提交、工作区源码快照和归档说明。
- 浏览器：Edge 153.0.4234.32、Chrome 152.0.7977.83、Firefox 155.0。共 158 项通过，0 项失败。
- 页面：七页；宽度 320/390/767/768/769/1023/1024/1025/1440px；浅深两主题。无全页横向溢出，正文不超过740px，无资源/JS异常。
- 交互：主题保存/刷新/跨页、明确选择优先于系统；标题/摘要/标签多词AND与分类组合、中文组合输入、URL恢复、无结果与重置、键盘操作。
- 降级：无脚本仍有七页导航和四篇静态索引；任一数据/列表脚本缺失或数据异常仍保留静态列表；存储读写抛错可当页切换；URL写入失败仍筛选；图片失败不塌陷。
- 子目录资源/文章/标签链接通过；焦点可见，跳过导航可用，减少动态生效。已做720px视口与2倍DPR的等效200%重排及长标题压力检查。
- 性能：本地1440px冷缓存子资源101864字节（不含HTML文档），完整滚动同值，Hero延迟加载时占位稳定；单张Hero导出43512/152086字节。
- 视觉：实际看图关闭VC0修订与VC1-B，23张当前截图归档。B/C曾有视线与书写不一致的问题，由D定向修复。
- 环境：Firefox首次在系统加密目录启动失败，改安装到工作区忽略目录后同版本通过；首次 smoke-checks.json 保留为历史失败，最终结论看 checks.json。
- 限制：真实手机、浏览器UI实际200%缩放与屏幕阅读器未执行。输入法测试为组合事件模拟，不冒充真人输入法测试。

### 历史阻塞的当前状态

- OB-01：已关闭，阶段提交已正常推送Gitee。
- OB-02：已关闭；Netlify不再是正式路径，Cloudflare公开地址已按B06核验。
- OB-03：三浏览器桌面/模拟移动已完成，真实手机仍未验证。
- OB-04：新VC0和VC1-B已关闭；增强VC2保持Deferred。

---

本文件是 Plan.md 第一部分与 `PROJECT_PLAN.html` §26 规定的正式验收记录。只记录实际执行过的检查；未执行项写“未验证”，失败项写复现方式与修复结果，不以模拟结果冒充真实设备或真实部署结果。

记录格式（Plan.md 第一部分 §五·2）：日期、浏览器、视口、主题、步骤、预期、实际、截图、修复结果。
以下早期 Stage 0～1 记录保留当时执行范围；本轮 Edge 与资产视觉检查见最新复验章节。

判定用词：

- **通过**：有实际执行的命令或人工检查作为证据。
- **失败**：有复现步骤与错误输出。
- **未验证**：受环境、账号或阶段范围限制，未执行；不得记为通过。

---

## 2026-09-15 · T00／T01 独立复验与 T02 验收

执行者：Codex（本会话；未调用历史调度中指定的 DeepSeek 模型）。基础版本：`2866ce8f55574bf1a475668e83a735f32f2830f7`。结论：**T00、T01 复验通过；T02 Passed；T04 Ready**。T03 部署仍未验证，不能据此宣布 Stage 1 或 Stage 2 全部完成。

### T00／T01 复验

- T00：五张 PNG 的 SHA256 与 T00 基线逐一一致；`git check-ignore -v --no-index` 验证 `.env`、`credentials.json`、`local.key` 被忽略，正式验收及派生资产不被误忽略。起始工作区干净，既有 milestone 历史保留；远端只读查询返回与本地一致的 `2866ce8`。既有推送证据保留，未把只读检查当成本轮写权限验证。
- 七页静态检查：唯一 h1、无重复 ID、所有内部 href 目标／锚点有效，站点相对根正确；隐藏增强控件齐全。未发现需要修改的页面缺陷。
- 浏览器：Microsoft Edge 153.0.4234.32（headless），1440×1000，未加载主题样式，禁用 JavaScript。七页直接 HTTP 访问均 200，响应字节与工作区文件一致；标题与描述分别唯一，公共 Header/Footer 规范化相对路径和当前项后相同。
- 每页执行 Tab → Enter：首个焦点为跳转链接，Enter 后焦点为 `#main`；七个增强控件全部不可见。点击“文章”导航后到达 Blog，静态文章索引可见；不存在文章返回 404。
- 证据：[浏览器结果](evidence/t02/browser-checks.json)、[无 JS 首页截图](evidence/t02/home-no-js.png)。Chrome／Firefox／真实手机及后续交互、视觉矩阵未执行，留给 T15／T16；本轮不标记它们通过。

### T02 资产

| 文件 | 裁切 `(x,y,w,h)` / 视框 | 输出 | 字节 | 结果 |
|---|---|---|---|---|
| `assets/images/character-front-upper.webp` | `(120,0,320,600)` | 320×600 WebP | 28,910 / ≤100,000 | 通过 |
| `assets/images/character-front-avatar.webp` | `(175,0,225,225)` | 225×225 WebP | 8,900 / ≤30,000 | 通过 |
| `assets/icons/favicon.svg` | `0 0 24 24` | 2px 描边 S 标识 | 315 | 通过 |

- 工具：`Z:/Anaconda/anaconda/python.exe`，Pillow 10.4.0、libwebp 1.3.2。两张图均 `quality=90, method=6`，RGB，未附带 ICC／EXIF／XMP；直接裁切后编码，无缩放、镜像、重绘或配色处理。默认 `py` 缺少 Pillow，实际采用现有 Anaconda 环境，没有新增项目依赖。
- 已查看原图与[并排对照](evidence/t02/character-comparison.png)：上身图保留呆毛、红眼镜、发丝、双臂与格纹；头像保留呆毛、脸与肩颈，无相邻人物或英文标签。裁切坐标无需调整，设计规范保持原值。
- Pillow 重新解码核对格式与尺寸，Edge 的 `Image.decode()` 核对自然尺寸为 320×600／225×225，均通过。生成后五张原图哈希再次比对一致。
- favicon 使用 `#F7F3EA` 纸色、`#242424` 墨色，无外部依赖；XML 解析与 viewBox 检查通过，[16／32px 浏览器截图](evidence/t02/favicon-sizes.png)目视通过。
- 三项资产 HTTP 均 200，响应与磁盘字节一致。本机 Python HTTP 服务将 WebP 标为 `application/octet-stream`，直接导航会触发下载，但 `<img>` 解码正常；T03／T22 部署应检查 `image/webp` 响应类型，不将本机服务行为当作正式部署通过。
- 精确编码参数、所有原图和发布资产 SHA256：[资产报告](evidence/t02/asset-report.json)。对照截图只作为 docs 验收证据，不是发布资源。
- 验收脚本首次使用宽泛 `header` 选择器遇到页面多个 header，改为 `.site-header`；资产直接导航触发下载后改用 HTTP 请求核对字节并单独验证图片解码。均为测试方法修正，无产品源码修复。
- 本次仅资产局部视觉验收，不代替七页静态视觉 VC1。T04 接入资源，T06 制作搜索流程图。

### 阶段 2 · T04 Tokens、公共组件与响应式基础

日期：2026-09-15｜执行者：DeepSeek｜基础版本：`4f91102`｜浏览器：Microsoft Edge 153.0.4234.32（headless=new + CDP）｜方式：本地 HTTP（`py -m http.server 8123 --bind 127.0.0.1`）＋ 静态审计脚本 ＋ 渲染检查脚本（均经 stdin 运行，不落盘）

结论：**T04 Passed**。静态审计 14 项全部 PASS；渲染检查 24 个页面×视口场景与 12 个断点边界场景全部 PASS，异常计数均为 0；首次渲染检查发现的 5 项偏差已修复并复测通过。

| 编号 | 检查项 | 步骤 | 预期 | 实际 | 结果 |
|---|---|---|---|---|---|
| S2-01 | Token 完整性 | 抽取 CSS 全部 `var(--x)` 与自定义属性定义 | 无悬空引用 | 93 个自定义属性、90 个被引用，悬空 0（`--status-art-height`、`--notice-width`、`--z-content` 为注册表预留） | 通过 |
| S2-02 | Token 取值对应规范 | 逐项比对 §4／§5／§16 注册表 | 取值一致 | 80 项逐一匹配；Mobile／Tablet／Desktop 覆盖值正确 | 通过 |
| S2-03 | 浅深主题成对映射 | 比对 `:root`、`:root[data-theme="light"]`、`:root[data-theme="dark"]`、系统跟随块 | 三套颜色集合一致 | 12 个颜色 Token 在三块中集合一致、浅深成对 | 通过 |
| S2-04 | 静态切换根主题 | 运行时把 `documentElement.data-theme` 置为 `dark` | 深色变量立即生效 | 每个场景的 `--color-paper` 由 `#F7F3EA` 变为 `#202223`，`color-scheme` 变为 `dark` | 通过 |
| S2-05 | 对比度 | 用 `getComputedStyle` 实测前景／背景色计算 WCAG 比值 | 普通文字 ≥4.5:1，大字／关键控件 ≥3:1 | 浅色 14.02／5.75／12.35／15.15；深色 12.02／7.91／7.96／10.78 | 通过 |
| S2-06 | 组件状态齐备 | 真实 `mouseMoved`／`mousePressed` 与属性状态检查 | 默认、Hover、Pressed、Focus、选中、异常状态可辨 | 次按钮 Hover 转 accent；主 CTA 按下位移 2px、阴影 4px→2px；当前导航 700＋2px 下划线，其余 400 无线；分类按钮选中 accent＋700＋`aria-pressed`；输入框聚焦 3px 轮廓 | 通过 |
| S2-07 | 横向溢出 | 320／360／390／768／1024／1440px 与 767／768／1023／1024px 边界 | 无整体横向溢出 | 36 个场景 `scrollWidth === clientWidth`，越界元素 0 | 通过 |
| S2-08 | 内容列与阅读列 | 实测容器内容宽与正文段宽 | 内容列 ≤1120px（不含 gutter）；正文与文章头部 ≤740px | 1440px 下内容列 1120px；Post 头部与正文在 ≥1024px 均为 740px | 通过 |
| S2-09 | 角色图尺寸与比例 | 实测显示尺寸与固有尺寸 | 不超过 Hero 220／300／360px、About 220／240／300px；不拉伸 | 320px 117×220、768px Hero 160×300／About 128×240、1024px 以上 Hero 192×360／About 160×300；固有尺寸始终 320×600 | 通过 |
| S2-10 | 装饰预算 | 检查胶带、网点、旁白与移动端隐藏 | Home 一角色＋两小装饰；About 仅胶带；≤767px 全部隐藏 | 1440px Home 胶带 48×16（跨图框角）、网点 64×64（1px 圆点／8px 间隔）；About 仅胶带；320～390px 两者 `display:none` | 通过 |
| S2-11 | 图像框与深色纸面 | 检查图框样式与深色下角色纸面 | 2px ink 边框、8px surface 内边距、0 圆角；深色保留插画自身纸面 | 图框 2px／8px／0px；图片背景 `#FFFFFF`、`object-fit: contain`、`aspect-ratio: 320/600`；深色截图普通控件无残留白底 | 通过 |
| S2-12 | 空状态顺序 | 临时移除 `hidden` 后测量（不写入产品文件） | 标题、说明、重置按钮在前，头像在后 | 头像 80×80（固有 225×225）位于按钮之后；状态块 `max-width: 640px`；七个控件高度均 46px | 通过 |
| S2-13 | 焦点与跳转链接 | Tab → Enter，检查轮廓与落点 | 跳转链接首个聚焦、可见可辨；Enter 后进入主内容 | 首焦点 `A.skip-link`，3px 轮廓／4px 偏移、视口内可见；Enter 后焦点为 `MAIN#main` | 通过 |
| S2-14 | 语义与隐藏控件 | 检查 `role`、按钮元素与 `hidden` 生效 | 导航保持链接语义；隐藏控件不进入 Tab 顺序 | `role="menu"` 仅菜单容器一处；增强控件均为 `<button>` 且 `display: none`；`[hidden]` 有保护规则 | 通过 |
| S2-15 | 资源与预算 | 七页与三类资源 HTTP 检查；统计首页本地资源字节 | 无 404；首页资源 ≤500KB | 页面／CSS／favicon／两张 WebP 全部 200 且字节与磁盘一致；首页本地资源 76,746 字节（74.9KB，未压缩） | 通过 |
| S2-16 | 禁用 JavaScript | Edge `--disable-javascript` 截图三页 | 样式、导航、静态索引、图片可用，增强控件不显示 | 三张截图确认可用，未出现不可操作的增强控件 | 通过 |
| S2-17 | 控制台与脚本错误 | 捕获 `Runtime.exceptionThrown`、`Log.entryAdded`、`Network.loadingFailed` | 无异常 | 36 个场景全部为 0 | 通过 |

#### 首次渲染检查发现并修复的偏差

| 编号 | 现象 | 规范依据 | 修复 | 复测 |
|---|---|---|---|---|
| D-01 | 内容列实测 1056px，小于规范的 1120px（把 gutter 计入了内容上限） | §6.1、§16.1 | `.container` 改为 `max-width: calc(var(--width-site) + 2 * var(--gutter))` | 1440px 下 1120px，通过 |
| D-02 | About 桌面两列未成立：介绍文本进入第二列，角色图掉到第二行 | §9.2、§11.4 | 角色图栅格项加 `grid-row: 1 / span 3` 与 `align-self: center`，文本自然落入第一列 | 1024／1440px 介绍与角色并排，通过 |
| D-03 | About 角色图 360px 超过 300px 上限（`--about-art-height` 未被任何规则引用） | §9.2、§16.1 | `.hero-art .art-frame__image` 用 `--hero-art-height`、`.about-hero-art .art-frame__image` 用 `--about-art-height` | 300px，通过 |
| D-04 | Tablet 档未定义角色图高度覆盖，768～1023px 仍为 220px | §14、§16.1 | `768px` 媒体查询补 `--hero-art-height: 300px`、`--about-art-height: 240px`、`--status-art-height: 240px` | 768px Hero 160×300／About 128×240，通过 |
| D-05 | Post 文章头部与正文实测 804px，超过 740px 阅读列 | §6.1、§11.3 | `.post` 与 `.post-back` 使用 `--width-reading`，不再叠加 gutter | ≥1024px 头部与正文均 740px，通过 |
| D-06 | 网点实测直径 2px（`--dot-size` 被当作半径使用） | §8、§16.2 | 第一次修正为 `radial-gradient(... calc(var(--dot-size)/2) ...)`；像素复测发现该写法在 8px 瓦片内不覆盖任何像素中心，网点**完全不可见**（0 个非纸色像素）。改为 8×8 SVG mask（圆心 (4,4)、r=0.5）＋显式 `mask-size: var(--dot-gap)`，颜色由 `background-color: var(--color-ink)` 经 mask 提供 | 8px 间隔、每片 64 点、浅色 `rgb(242,238,229)`、深色 `rgb(37,38,39)`（均与 `#F2EEE5` @ 8% 的混色逐字节相符）。实测渲染为 2×2 设备像素；因 `--dot-size` 声明 1px，该差异记为 VC1 复核项 |
| D-07 | 胶带整体位于图框外约 8px | §8 | 改为偏移半个尺寸，跨图框右上角 | 胶带 48×16 跨角放置，通过 |

证据：

- [渲染报告](evidence/t04/render-report.txt)（场景矩阵、边界、主题、组件状态、键盘、汇总与截图清单）
- [渲染检查原始数据](evidence/t04/render-checks.json)（36 个场景的完整计算样式与几何测量）
- [像素级复验](evidence/t04/pixel-verification.md)（直接从截图测量：内容列、角色图高度、网点颜色与间隔、胶带跨角、深色标题色、移动端装饰、空状态顺序）
- 截图：`home-1440-light.png`、`home-1440-dark.png`、`home-768-light.png`、`home-390-light.png`、`home-390-dark.png`、`home-320-light.png`、`blog-1440-light.png`、`blog-390-dark.png`、`about-1440-light.png`、`about-390-light.png`、`post-1440-light.png`、`post-390-light.png`、`blog-preview-empty-1440-light.png`、`focus-skip-link-1440-light.png`、`home-nojs-1440-light.png`、`home-nojs-390-light.png`、`post-nojs-1440-light.png`（均位于 `docs/evidence/t04/`）
- 脚本：`docs/evidence/t04/audit.mjs`（静态审计）、`docs/evidence/t04/render-checks.mjs`（Edge headless + CDP 渲染检查）、`docs/evidence/t04/html-check.mjs`（HTML 结构）、`docs/evidence/t04/dots-pixel-check.mjs`（网点像素测量）

未验证项：Chrome／Firefox／真实手机未执行（OB-03）；观感类判据与 VC1 正式视觉结论未执行（OB-04）；本机 Edge 在沙箱内启动 headless 时崩溃，浏览器检查在放宽沙箱后完成，属环境限制而非产品缺陷。

已知容差（非阻塞，留 VC1）：网点声明 `--dot-size: 1px`，Edge 153 在 1× 缩放下实测渲染为 2×2 设备像素的均匀网点；直接按 1×1 制作的 mask 会被缩放到整块瓦片（铺满约 78% 面积），2×2 瓦片则会渲染成 4×4 色块且混色不均，因此保留当前几何并在 VC1 复核。

---

## 阶段 0 · 执行基线与工程准备（T00）

日期：2026-09-15｜执行者：DeepSeek（T00）｜基础版本：`8747276b513f29d3a87b037dda40322d5ab3d2ad`

| 编号 | 检查项 | 步骤 | 预期 | 实际 | 结果 |
|---|---|---|---|---|---|
| S0-01 | 文档依据明确 | 阅读 `Plan.md` 全文、`DESIGN_SPEC.md` §1～§17、`PROJECT_PLAN.html` §1～§14／§19～§24、`AGENTS.md` | 实施范围、视觉契约与验收标准可追溯 | 基线、页面契约、Token 注册表与验收清单均已核对 | 通过 |
| S0-02 | 参考原图保留 | `Get-FileHash -Algorithm SHA256 参考素材\*.png` | 五张 PNG 未被覆盖、移动或重编码 | 五个哈希记录于 `docs/agent-handoffs.md` T00 基础版本，工作区文件未改动 | 通过 |
| S0-03 | 忽略规则有效 | `git check-ignore -v docs/acceptance.md 参考素材/角色三视图.png posts` | 交付文件不被忽略；凭据与环境文件被忽略 | `docs/`、`参考素材/`、后续 `posts/` 均未被忽略；`.gitignore` 覆盖 `.env*`、`credentials.json`、`*.pem`、`*.key`、`.ssh/` | 通过 |
| S0-04 | 仓库无凭据 | 检查新增文件内容与跟踪文件清单 | 无账号、令牌、私钥、本地密钥路径 | 未发现任何凭据类内容 | 通过 |
| S0-05 | 远端只读可用 | `git -c http.sslBackend=openssl ls-remote origin` | 返回 `refs/heads/main` | 返回 `8747276b513f29d3a87b037dda40322d5ab3d2ad refs/heads/main` | 通过 |
| S0-06 | 远端写入可用 | `git -c http.sslBackend=openssl push origin main` | 认证成功并完成推送 | 首次在默认沙箱下失败（见 OB-01 复现记录）；放宽沙箱后推送成功：`8747276..8a42ddb main -> main`，`ls-remote` 返回 `refs/heads/main = 8a42ddb583fbcb06d7669c8615e3929de4adea11`，本地与远端 `ahead/behind = 0 0` | 通过 |
| S0-07 | 托管账户条件 | 检查 Netlify 登录态与课程网络条件 | 具备可部署账户，或明确记录缺失 | 本环境无 Netlify 登录态／令牌；用户决定本轮只实施 T00／T01 | 未验证（外部阻塞 OB-02） |
| S0-08 | 执行记录落盘 | 检查 `docs/` | 三份记录存在且可续写 | `docs/agent-handoffs.md`、`docs/acceptance.md`、`docs/visual-review.md` 已建立 | 通过 |

## 阶段 1 · 七页语义骨架（T01）

日期：2026-09-15｜执行者：DeepSeek（T01）｜基础版本：T00 里程碑提交（提交哈希见 `Change_log.md` 与 Git 历史）

| 编号 | 检查项 | 步骤 | 预期 | 实际 | 结果 |
|---|---|---|---|---|---|
| S1-01 | 七页存在且可访问 | 本地 HTTP 服务逐页请求 | 七个页面全部 HTTP 200 | 见「阶段 1 执行输出」 | 通过 |
| S1-02 | 语言与元数据 | 脚本检查 `lang`、`<title>`、`meta description` | `lang="zh-CN"`；标题与描述各自唯一 | 七页 `lang="zh-CN"`，标题与描述均唯一 | 通过 |
| S1-03 | 唯一 `h1` | 统计每页 `<h1>` | 每页恰好一个 `h1` | 七页各 1 个 | 通过 |
| S1-04 | 跳转链接有效 | 检查跳转链接为页面首个可聚焦元素且目标存在 | 目标 `#main` 存在 | 七页均满足 | 通过 |
| S1-05 | 七页链接互通 | 解析全部内部 `href`（含 `?category=`、`?q=`） | 目标文件与锚点存在，无死链 | 见「阶段 1 执行输出」 | 通过 |
| S1-06 | 文章页相对路径 | 检查文章页引用与站点根标记 | 文章页统一 `../`，`data-site-root="../"` | 四篇文章页均正确，无域名根路径 | 通过 |
| S1-07 | 禁用 JS 仍可导航 | 检查页面是否依赖脚本渲染导航与文章入口 | 无脚本依赖，静态索引可读 | 阶段 1 页面不含 `<script>`；导航、四篇索引与正文开篇段为静态 HTML | 通过 |
| S1-08 | 增强控件不残留 | 检查未实现的增强控件 | 未实现的控件默认 `hidden`，不进入 Tab 顺序 | 主题按钮、快捷菜单按钮、阅读进度、返回顶部、提示区、复制面板、菜单容器均为 `hidden` | 通过 |
| S1-09 | 公共结构一致 | 比对七页 Header／Footer 块 | 除当前页标记与相对根外一致 | 见「阶段 1 执行输出」 | 通过 |
| S1-10 | 最小版本部署 | 按 T03 执行最小部署 | 公开 HTTPS 地址与对应提交 | 未执行，见 OB-02 | 未验证（延期） |

### 阶段 1 执行输出

日期：2026-09-15｜方式：本地 HTTP 服务（`py -m http.server 8000 --bind 127.0.0.1`）+ 临时结构检查脚本（经 stdin 运行，未落盘）

**1. 页面结构与元数据**

```text
页面                                       链接  h1  script  css  img
index.html                                  19   1       0    0    0
blog.html                                   13   1       0    0    0
about.html                                   9   1       0    0    0
posts/attention-intuition.html              11   1       0    0    0
posts/dom-search-notes.html                 11   1       0    0    0
posts/paper-reading-notes.html              11   1       0    0    0
posts/leave-some-space.html                 11   1       0    0    0

Header 一致性: 一致
Footer 一致性: 一致
标题/描述唯一性: 通过
结果: PASS
```

- 七页均为 `lang="zh-CN"`，`data-site-root` 与页面层级一致（顶层 `./`、文章页 `../`），`data-page` 分别为 `home`／`blog`／`about`／`post`。
- 每页恰好 1 个 `h1`；每页 `<title>` 与 `meta description` 各 1 个且七页互不重复。
- 每页首个链接均为指向 `#main` 的跳转链接，`#main` 存在且 `tabindex="-1"`。
- 每页均含七个增强控件挂载点（`#reading-progress`、`#theme-toggle`、`#quick-menu-button`、`#back-to-top`、`#site-notice`、`#copy-panel`、`#context-menu`），全部带 `hidden` 属性。
- 阶段 1 页面含 0 个 `<script>`、0 个样式表引用、0 个 `<img>`：无脚本依赖，禁用 JS 时导航与四篇静态索引完全可用；不引用尚不存在的资源，因此无 404。
- 当前页标记：顶层页 `aria-current="page"`，文章页在“文章”导航项使用 `aria-current="true"`（当前分区而非当前页面本身）。

**2. 链接解析**

- 逐页解析全部内部 `href`（含 `?category=` 与锚点），目标文件与锚点均存在，无死链。
- 分类查询参数仅出现 `ai`／`coding`／`research`／`life`，未出现未知分类。
- 文章页全部使用 `../` 上级相对路径，未出现域名根路径或硬编码域名。
- Header 块与 Footer 块在七页中除 `aria-current` 与相对根外完全一致。

**3. 本地 HTTP**

```text
/index.html                    200 text/html  6145 bytes
/blog.html                     200 text/html  5922 bytes
/about.html                    200 text/html  5908 bytes
/posts/attention-intuition.html    200 text/html  3508 bytes
/posts/dom-search-notes.html       200 text/html  3608 bytes
/posts/paper-reading-notes.html    200 text/html  3571 bytes
/posts/leave-some-space.html       200 text/html  3399 bytes
/posts/missing.html            404（反向确认服务与路径解析正常）
```

- 七个页面的响应字节与工作区文件 SHA256 完全一致，且均以 UTF-8 正常解码，服务过程无脚本错误。
- 说明：`py -m http.server` 的 `Content-Type` 不含 `charset`，浏览器按页面内 `<meta charset="utf-8">` 解析，中文显示正常；部署平台以 HTTPS 响应头为准，不作为缺陷记录。

**4. 记录修正**

- 首次检查发现文章页缺少当前分区标记，已为四篇文章页的“文章”导航项补 `aria-current="true"`，复检通过。该问题只影响状态表达，未影响导航可用性。

---

## 外部阻塞与未验证项

| 编号 | 项目 | 现象与证据 | 影响 | 处理 |
|---|---|---|---|---|
| OB-01 | Gitee 推送认证 | 默认 TLS 后端报 `schannel: AcquireCredentialsHandle failed: SEC_E_NO_CREDENTIALS (0x8009030e)`；改用 `-c http.sslBackend=openssl` 后读操作正常；`push --dry-run` 在默认沙箱下凭据助手无法启动（`sh.exe: couldn't create signal pipe, Win32 error 5`），随后报 `could not read Username for 'https://gitee.com'` | 曾一度只阻塞远端推送，不阻塞本地实施与提交 | **已关闭（2026-09-15）**：同一推送命令在放宽沙箱后成功（凭据助手可正常启动并使用已保存凭据），`8747276..8a42ddb` 已推送到 `origin/main`，后续文档记录提交同样推送成功，`git rev-list --left-right --count origin/main...main` 为 `0 0`。后续推送继续使用 `git -c http.sslBackend=openssl push origin main` |
| OB-02 | Netlify 最小部署（T03） | 本环境无 Netlify 登录态或访问令牌；用户决定本轮先完成 T00／T01 | 阻塞 Stage 1 的 T03 与最终公开网址验收 | 不执行部署、不生成发布目录、不填写任何地址；在 T22 前关闭 |
| OB-03 | 真实设备与浏览器矩阵 | 本阶段无可视界面，未进行 Chrome／Edge／Firefox 与手机检查 | 不影响 Stage 0～1 | Stage 7～8（T15／T16）执行，未执行前保持“未验证” |
| OB-04 | 视觉检查点 VC1／VC2 | Stage 0～1 无静态视觉产物 | 不影响 Stage 0～1 | 见 `docs/visual-review.md`。T04 已完成像素级工程自检（见上）与两主题截图，但 VC1 为正式视觉门槛，须在 T07／T08 完成后由指定视觉模型执行；自检结论不替代 VC1 |

## 已知问题（不阻塞）

| 编号 | 现象 | 影响 | 处理 |
|---|---|---|---|
| KN-01 | 仓库无 `.gitattributes`，Git 提示 `LF will be replaced by CRLF` | 可能造成换行符反复变化 | `.gitattributes` 不在 T00 允许修改清单内，本轮不新增，仅记录，供后续任务决定 |
| KN-02 | 原 T00／T01 会话模型不支持图片输入（历史限制） | 当前 Codex 会话支持图片查看，已核对 T02 原图、裁切及 favicon | 本轮 T02 已解决；VC1／VC2 仍按各自门槛执行 |
| KN-03 | 本机 Playwright 截图偶发写入失败：`UNKNOWN: unknown error, open '…\*.png'`（E03 期间约每轮 158 项中随机出现 1 次，落在不同 PNG 上；同一路径重复写入 40 次无复现） | 只影响证据图片落盘，同轮页面对应的测量断言均通过 | E03 已在 `scripts/check-baseline.mjs` 的 `shot()` 内加入一次重试（参数与断言不变），E03 后回归稳定 158/0；若后续再次出现，按环境问题记录并复跑该文件 |


## B01 内容基线 · 2026-09-15

七页唯一h1、内部文件链接检查通过；四篇正文、日期、摘要、分类、标签、相邻导航已补齐；全部为示例。浏览器视觉与JS在B05验收。
