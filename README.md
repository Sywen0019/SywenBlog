# Sywen's Space

采用原生 HTML、CSS 和 JavaScript 构建的漫画线稿风个人博客，主题为「代码 · 科研 · 生活」。

## 当前状态

已完成 **Stage 0（T00）**、**T01 七页语义骨架**、**T02 指定视觉资产派生** 与 **Stage 2 的 T04 视觉基础**。Stage 1 的 T03 部署仍未验证，Stage 3 的 T05 可开始：

- 七个语义化 HTML 页面可独立访问：`index.html`、`blog.html`、`about.html` 与 `posts/` 下四篇文章页。
- 公共 Header／Footer、静态文章入口、站点根标记、跳转链接与增强控件挂载位置已建立；禁用 JavaScript 时导航与文章索引仍可用。
- 三个样式表已建立完整 Token 注册表、浅深主题与基础响应式：纸色界面、1px／2px 线条层级、硬阴影按钮、角色图框与装饰预算、740px 阅读列。
- 两张角色 WebP 与 favicon 已接入：Home Hero（跨角胶带、网点、旁白）、About 角色图、Blog 空状态方形头像。
- 尚无 JavaScript；文章日期、摘要、标签、正文与筛选交互分别由 T05～T08、T10～T14 补齐。尚无公开部署地址与自动化测试；不引入构建步骤、生产依赖或测试框架。

完整阶段划分见 [前端实施计划](Plan.md)。

## 目录结构

```text
Sywen-Blog/
├── index.html blog.html about.html     # 顶层页面
├── posts/                              # 四篇文章页
├── css/                                # base.css（Tokens 与主题）／components.css／pages.css
├── assets/                             # 两张角色 WebP 与 SVG favicon
├── docs/                               # 执行记录（交接、验收、视觉检查点、证据）
├── 参考素材/                            # 五张参考 PNG（不参与网页加载）
├── PROJECT_PLAN.html                   # 功能与验收规划（29 章）
├── DESIGN_SPEC.md                      # 视觉设计规范
├── Plan.md                             # 实施基线与任务调度
└── Change_log.md                       # 变更记录
```

## 主题契约

浅色与深色由根元素属性切换：`<html data-theme="light">` 或 `<html data-theme="dark">`。未设置该属性时跟随系统 `prefers-color-scheme`，无脚本时同样跟随系统。三个样式表按 `base.css` → `components.css` → `pages.css` 顺序加载，文章页使用 `../` 上级相对路径。

## 本地预览

直接打开 `index.html` 即可阅读，完整检查建议使用本地 HTTP 服务：

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

浏览器访问 <http://127.0.0.1:8000/index.html>；项目规划页面位于 <http://127.0.0.1:8000/PROJECT_PLAN.html>。服务运行时保持终端开启，按 `Ctrl+C` 停止。

## 执行记录

- [任务交接记录](docs/agent-handoffs.md)：任务状态、DOM 与路径契约、未验证项。
- [验收记录](docs/acceptance.md)：阶段验收结果、外部阻塞与已知问题。
- [视觉检查点](docs/visual-review.md)：VC1／VC2 问题与复核记录。

## 开发与验证

使用原生多页面结构，无需安装前端依赖。功能与响应式验收依据项目规划第 26 章与视觉规范 §17.4，结果写入 `docs/acceptance.md`。每完成一个阶段即提交，提交信息使用 `docs:`、`feat:`、`style:`、`fix:`、`test:` 前缀。

## 代码仓库

[Gitee · Sywen7777/Blog](https://gitee.com/Sywen7777/Blog)

本机网络环境下默认 TLS 后端可能报 `schannel: AcquireCredentialsHandle failed`，此时可用 OpenSSL 后端访问远端：

```powershell
git -c http.sslBackend=openssl push origin main
```

## 素材来源

界面所用参考图片为用户提供的工作区参考素材，存放于 `参考素材/`，仅作为设计与实现的参考依据，不在网页中加载，也不改写原始文件。
