# Sywen's Space

采用原生 HTML、CSS 和 JavaScript 构建的漫画线稿风个人博客，主题为「代码 · 科研 · 生活」。

## 当前状态

项目处于规划阶段，已完成项目规划、视觉设计规范和实施计划整理。博客页面与交互功能尚未实现，目前没有构建步骤、生产依赖或自动化测试命令。

计划包含首页、博客列表、关于页面和四篇独立文章，以及搜索分类、主题切换和阅读辅助功能。

## 文档入口

- [项目规划（29 章）](PROJECT_PLAN.html)：内容、功能与验收要求，建议在浏览器中阅读。
- [视觉设计规范](DESIGN_SPEC.md)：布局、主题和参考素材使用规范。
- [前端实施计划](Plan.md)：实施基线、任务拆分与验证安排。
- [仓库协作指南](AGENTS.md)：目录结构、代码风格和提交约定。
- [参考素材](参考素材/)：五张设计参考 PNG。

## 本地预览

在 Windows PowerShell 中进入项目目录，可直接打开项目规划：

```powershell
Start-Process .\PROJECT_PLAN.html
```

如已安装 Python，也可启动本地 HTTP 服务：

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

浏览器访问 [项目规划](http://127.0.0.1:8000/PROJECT_PLAN.html)。服务运行时保持终端开启，按 `Ctrl+C` 停止。博客实现后，首页入口为 `/index.html`。

## 开发与验证

实施前阅读项目规划与视觉规范；使用原生多页面结构，无需安装前端依赖。后续按照项目规划第 26 章进行功能与响应式验收，并将结果记录在 `docs/acceptance.md`（尚未创建）。

## 代码仓库

[Gitee · Sywen7777/Blog](https://gitee.com/Sywen7777/Blog)
