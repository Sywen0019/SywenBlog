# Change Log

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
