# 验收记录

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
