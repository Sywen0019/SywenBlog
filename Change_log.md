# Change Log

按时间倒序记录项目变更：日期、变更摘要与验证结果。功能与验收依据见 [PROJECT_PLAN.html](PROJECT_PLAN.html)、[DESIGN_SPEC.md](DESIGN_SPEC.md) 与 [Plan.md](Plan.md)。

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
