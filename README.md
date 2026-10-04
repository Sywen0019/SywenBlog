# Sywen's Space

原生 HTML、CSS、JavaScript 的漫画线稿风个人博客。Research · Code · Life。

**V2 已发布（2026-10-04）：** 首页、文章、研究、履历、关于五个正式页面共用既有文章体系；首页按 Hero → Latest → Selected + Now → Off the Desk → Footer 组织。十页页脚同时提供 Gitee 和 GitHub 入口。V2 已推送双仓并由 Cloudflare 自动发布，公开文件/路径 52/0、核心浏览器 18/0；详见 [发布证据](docs/evidence/v2/release/README.md)。内容缺口和边界见 [执行记录](docs/tasks/04-v2/README.md)。

**内容同步：** 一份文章 JSON 生成动态数据、无脚本索引、编号、元信息及相邻导航。身份共用一份来源，正文继续手写 HTML。Python 3 用于本地同步和构建检查，网站运行无依赖。详细步骤见 [发文说明](docs/publishing.md)。

```powershell
py scripts/sync-content.py --write
py scripts/sync-content.py --check
py scripts/test-content.py
```

下面“作业要求对应”和 E06 结果记录原公开版本；当前源码以 V2 契约为准。V2 验收使用独立证据目录，不覆盖历史报告。原 E01 首页分类构图已退役，其资产与 Blog 无缩略图等有效检查由 V2 检查接续。

**作业基线已完成。** 八页内容、CSS、主题切换、搜索与分类组合、书桌 Hero、Gitee 源码与公开 HTTPS 均已验收。E01–E05 已通过本地回归，E06 已完成八页视觉扩展、VC2 和公开发布核验（2026-09-28）。

- [访问网站](https://sywen-blog.pages.dev/)
- [Gitee 源码与提交历史](https://gitee.com/Sywen7777/Blog)
- [GitHub 源码与提交历史](https://github.com/Sywen0019/SywenBlog)
- [线上版本信息](https://sywen-blog.pages.dev/version.json)
- [交付与演示](docs/delivery.md) · [任务索引](docs/tasks/00-index.md)

## 作业要求对应

|要求|实现与证据|
|---|---|
|HTML|Home、Blog、About 与五篇完整文章（两篇 skill 设计长文、一篇生活随笔、一篇示例、一篇测试样例），导航和文章深链接|
|CSS|四份样式表，纸面/线稿语言、浅深主题、手机重排、740px阅读列|
|JavaScript|主题切换保存；标题/摘要/标签多词AND搜索；分类组合、数量、无结果与重置|
|Git/Gitee|真实分阶段历史；main推送至Gitee，基线标签 coursework-baseline|
|公开网站|Cloudflare Pages HTTPS；八页与资源和源提交逐文件核对|
|美术|电脑旁低头用平板与手写笔书写；640/1280 WebP，采用J，红色下半框与设备纯线稿|

两篇 skill 设计长文介绍 `ncs-figure-design` 与 `research-reading` 的工作流；《给学习留一点空白》标为示例；《和流萤做同桌》是本人随笔；《六月：单细胞与基因调控网络笔记》由文档转换发布，列表与文章页标注「测试样例」。作者的计算机专业与设备习惯来自本人说明。

当前一级分类为「学业／生活／我喜欢的」（`study`／`life`／`favorites`），文章数量为 3／1／1；旧 `ai`、`coding`、`research` 查询参数会兼容到 `study`。线上地址仍按现有发布流程更新。

## 本地预览

无需安装前端依赖；修改元数据后先同步，再预览：

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

访问 http://127.0.0.1:8000/index.html 。禁用脚本仍可阅读和导航。

## 目录与约定

- 顶层五个正式 HTML 与 `posts/` 文章；`css/`：base / components / narrative / pages。
- `js/`：theme / posts-data / site / blog / hero / motion / reading / context-menu，经典脚本通过 `window.Sywen` 共享；hero 仅首页加载。
- `content/`：文章、分类、身份和正式页面清单；`templates/`：新文章骨架；两者都不发布。
- `assets/`：已采用图片与SVG；`参考素材/`：用户参考，不发布。
- `scripts/`：发布、验收、录像；`docs/`：任务、交接、美术、验收和证据。
- `PROJECT_PLAN.html` / `Plan.md` / `DESIGN_SPEC.md`：规格、当前B/E计划和视觉边界。

主题优先级为保存的有效选择→系统→浅色，存储键 `sywen.theme`；存储失败时仍可当页切换。搜索按空白拆分、多词AND，与分类同时生效；保留 `q` / `category` 和中文组合输入，旧 `ai`／`coding`／`research` 分类参数映射到 `study`。列表准备成功才隐藏静态索引，失败仍可读。

资源本地托管，相对路径支持子目录；Hero不懒加载并设固有尺寸。分类小画已实施（E01，首页分类入口；Blog 保持文字档案列表，`assets/images/cat-*.webp`，首页「最近文章」保持纯文字）。返回顶部与顶部阅读进度已实施（E03，`js/reading.js`），复制与快捷菜单已实施（E04，`js/context-menu.js`）。

## 验收与复现

最新全站验收与发布状态见 [E06](docs/evidence/e06/README.md)。原冷白细颗粒保留，正文与背景连续；深色透明装饰改为柔和浅灰线稿。

历史基线（2026-09-16）：本地 **161项**（E01 后全量回归）、线上三浏览器核心 **15项**、线上源码/路径 **25项**均通过。增强版最终线上结果见 [E06 证据](docs/evidence/e06/README.md) 与 [新版演示](docs/evidence/e06/final/public/enhanced-demo.webm)；报告与历史演示仍保留。

E03 阅读增强复验（三浏览器各 18 项、0 失败；E01 后博客列表像素基线在 `docs/evidence/e01/references/`）：

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.tmp-browser/browsers'
node docs/evidence/e03/reading-checks.mjs --browser=edge,chrome,firefox
```

报告写入 `docs/evidence/e03/`，截图 `e03-*.png`。

E01 保留资产复验（原首页分类构图已退役；当前布局使用 scripts/check-v2.mjs）：

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.tmp-browser/browsers'
node docs/evidence/e01/illustration-checks.mjs --assets-only
```

报告应通过 `SYWEN_EVIDENCE_DIR` 写入本轮独立目录；分类 WebP 由 `py scripts/export-category-art.py` 从 `art-work/` 母版确定性导出。

网站运行不依赖以下工具。复验需要Node.js 24、Edge/Chrome及Python3：

```powershell
npm install --prefix .tmp-browser playwright@1.63.0
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.tmp-browser/browsers'
node .tmp-browser/node_modules/playwright/cli.js install firefox
node scripts/check-baseline.mjs
node scripts/check-baseline.mjs --public
py scripts/check-release.py --expected-commit HEAD
node scripts/record-demo.mjs
```

工具与浏览器位于忽略目录；基线默认报告写入 `docs/evidence/baseline/`；本轮设置 `SYWEN_EVIDENCE_DIR=docs/evidence/e06/final/<suite>` 隔离证据。增强演示默认写入 `docs/evidence/e06/final/public/`。记录父提交和网站文件哈希。`SYWEN_PUBLIC_URL`可覆盖浏览器线上验收地址。

限制：手机是视口模拟；200%为等效视口重排；未做实体手机、浏览器UI实际缩放或屏幕阅读器测试，中文输入法为组合事件模拟。

## 发布

GitHub main → Cloudflare Pages → `bash scripts/build-site.sh` → dist。Gitee origin/main 是课程源码入口。

```powershell
git -c http.sslBackend=openssl push origin main
git -c http.sslBackend=openssl push github main
```

构建先检查内容同步，按 content/pages.json 白名单打包；排除内容来源、模板、参考、母版、文档和测试工具；生成version.json记录源提交。最小404响应关闭默认SPA回落，完整插画404仍在Backlog。配置和Windows本地构建方法见[部署说明](docs/deployment.md)。GitHub Pages的codex/pages仅作历史备选，本轮不更新。

## 素材与后续

重点在Hero，阅读区克制；用户参考保持原样。复杂人物由Codex内置出图，正式导出已入仓库，原始候选不发布。工具未提供可核实版本，不把实际调用写成已验证的“GPT-image2.5”。

详见[美术记录](docs/art-direction.md)、[提示词](docs/hero-prompts.md)、[视觉验收](docs/visual-review.md)。About 阅读人物与静态转场已完成，素材与提示词见 [A02 记录](docs/about-prompts.md)；E05 状态角色与局部精修已本地完成，提示词见 [A09 记录](docs/state-prompts.md)，验收见 [E05 证据](docs/evidence/e05/README.md)；增强版发布与 VC2 由 E06 统一执行。
