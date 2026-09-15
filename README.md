# Sywen's Space

采用原生 HTML、CSS 和 JavaScript 构建的漫画线稿风个人博客，主题为「代码 · 科研 · 生活」。

## 当前状态

已完成 **Stage 0（执行基线与工程准备）**：

- 建立执行记录：任务交接、验收结果与视觉检查点，见下方「执行记录」。
- 参考素材、忽略规则与远端条件已核实；原始五张 PNG 未改动，仓库不含凭据。
- 页面、样式与脚本尚在后续阶段实施：Stage 1 建立七个语义化 HTML 页面骨架，Stage 2 起进入视觉与资产。
- 尚无公开部署地址与自动化测试；不引入构建步骤、生产依赖或测试框架。

完整阶段划分见 [前端实施计划](Plan.md)。

## 目录结构

```text
Sywen-Blog/
├── index.html blog.html about.html     # 顶层页面（Stage 1 建立）
├── posts/                              # 四篇文章页（Stage 1 建立）
├── docs/                               # 执行记录（交接、验收、视觉检查点）
├── 参考素材/                            # 五张参考 PNG（不参与网页加载）
├── PROJECT_PLAN.html                   # 功能与验收规划（29 章）
├── DESIGN_SPEC.md                      # 视觉设计规范
├── Plan.md                             # 实施基线与任务调度
└── Change_log.md                       # 变更记录
```

## 本地预览

当前阶段可直接在浏览器中打开规划文档；页面骨架建立后，建议使用本地 HTTP 服务检查导航与文章深链接：

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

浏览器访问 <http://127.0.0.1:8000/PROJECT_PLAN.html>，页面建立后使用 <http://127.0.0.1:8000/index.html>。服务运行时保持终端开启，按 `Ctrl+C` 停止。

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
