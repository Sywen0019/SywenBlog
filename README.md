# Sywen's Space

原生 HTML、CSS、JavaScript 的漫画线稿风个人博客。Study · Life · Favorites。

**作业基线已完成。** 七页内容、CSS、主题切换、搜索与分类组合、书桌 Hero、Gitee 源码与公开 HTTPS 均已验收。E01（分类小画）、E02（About 阅读人物与静态转场）、E03（阅读增强）、E04（复制与快捷菜单）已在本地完成并通过检查，E05／E06 保持 Deferred。

- [访问网站](https://sywen-blog.pages.dev/)
- [Gitee 源码与提交历史](https://gitee.com/Sywen7777/Blog)
- [线上版本信息](https://sywen-blog.pages.dev/version.json)
- [交付与演示](docs/delivery.md) · [任务索引](docs/tasks/00-index.md)

## 作业要求对应

|要求|实现与证据|
|---|---|
|HTML|Home、Blog、About 与四篇完整示例文章，导航和文章深链接|
|CSS|三份样式表，纸面/线稿语言、浅深主题、手机重排、740px阅读列|
|JavaScript|主题切换保存；标题/摘要/标签多词AND搜索；分类组合、数量、无结果与重置|
|Git/Gitee|真实分阶段历史；main推送至Gitee，基线标签 coursework-baseline|
|公开网站|Cloudflare Pages HTTPS；七页与资源和源提交逐文件核对|
|美术|电脑旁低头用平板与手写笔书写；640/1280 WebP，当前本地采用J，红色下半框与设备纯线稿；线上仍是旧D|

四篇文章标为示例，不冒充科研成果。作者的计算机专业与设备习惯来自本人说明。

当前本地一级分类为「学业／生活／我喜欢的」（`study`／`life`／`favorites`），文章数量为 3／1／0；旧 `ai`、`coding`、`research` 查询参数会兼容到 `study`。线上地址仍按现有发布流程更新。

## 本地预览

无需安装前端依赖，不需要编译：

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

访问 http://127.0.0.1:8000/index.html 。禁用脚本仍可阅读和导航。

## 目录与约定

- 顶层三个HTML与 `posts/` 四篇文章；`css/`：base / components / pages。
- `js/`：theme / posts-data / site / blog / reading，经典脚本通过 `window.Sywen` 共享。
- `assets/`：已采用图片与SVG；`参考素材/`：用户参考，不发布。
- `scripts/`：发布、验收、录像；`docs/`：任务、交接、美术、验收和证据。
- `PROJECT_PLAN.html` / `Plan.md` / `DESIGN_SPEC.md`：规格、当前B/E计划和视觉边界。

主题优先级为保存的有效选择→系统→浅色，存储键 `sywen.theme`；存储失败时仍可当页切换。搜索按空白拆分、多词AND，与分类同时生效；保留 `q` / `category` 和中文组合输入，旧 `ai`／`coding`／`research` 分类参数映射到 `study`。列表准备成功才隐藏静态索引，失败仍可读。

资源本地托管，相对路径支持子目录；Hero不懒加载并设固有尺寸。分类小画已实施（E01，首页分类卡与 Blog 条目缩略图，`assets/images/cat-*.webp`，首页「最近文章」保持纯文字）。返回顶部与顶部阅读进度已实施（E03，`js/reading.js`），复制与快捷菜单已实施（E04，`js/context-menu.js`）。

## 验收与复现

2026-09-16：本地 **161项**（E01 后全量回归）、线上三浏览器核心 **15项**、线上源码/路径 **25项**均通过（线上仍为既有部署，增强版待 E06 发布后复验）。报告与截图见[验收记录](docs/acceptance.md)，[演示录像](docs/evidence/baseline/baseline-demo.webm)展示实际线上操作。

E03 阅读增强复验（三浏览器各 18 项、0 失败；E01 后博客列表像素基线在 `docs/evidence/e01/references/`）：

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.tmp-browser/browsers'
node docs/evidence/e03/reading-checks.mjs --browser=edge,chrome,firefox
```

报告写入 `docs/evidence/e03/`，截图 `e03-*.png`。

E01 分类小画复验（三浏览器各 49 项、0 失败）：

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.tmp-browser/browsers'
node docs/evidence/e01/illustration-checks.mjs --browser=edge,chrome,firefox
```

报告写入 `docs/evidence/e01/`，含合并报告与桌面/手机/深色/失败态截图；分类 WebP 由 `py scripts/export-category-art.py` 从 `art-work/` 母版确定性导出。

网站运行不依赖以下工具。复验需要Node.js 24、Edge/Chrome及Python3：

```powershell
npm install --prefix .tmp-browser playwright@1.63.0
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.tmp-browser/browsers'
node .tmp-browser/node_modules/playwright/cli.js install firefox
node scripts/check-baseline.mjs
node scripts/check-baseline.mjs --public
py scripts/check-release.py
node scripts/record-demo.mjs
```

工具与浏览器位于忽略目录；报告写入 `docs/evidence/baseline/`，记录父提交和网站文件哈希。`SYWEN_PUBLIC_URL`可覆盖浏览器线上验收地址。

限制：手机是视口模拟；200%为等效视口重排；未做实体手机、浏览器UI实际缩放或屏幕阅读器测试，中文输入法为组合事件模拟。

## 发布

GitHub main → Cloudflare Pages → `bash scripts/build-site.sh` → dist。Gitee origin/main 是课程源码入口。

```powershell
git -c http.sslBackend=openssl push origin main
git -c http.sslBackend=openssl push github main
```

白名单排除参考、母版、文档和测试工具；生成version.json记录源提交。最小404响应关闭默认SPA回落，完整插画404仍在Backlog。配置和Windows本地构建方法见[部署说明](docs/deployment.md)。GitHub Pages的codex/pages仅作历史备选，本轮不更新。

## 素材与后续

重点在Hero，阅读区克制；用户参考保持原样。复杂人物由Codex内置出图，正式导出已入仓库，原始候选不发布。工具未提供可核实版本，不把实际调用写成已验证的“GPT-image2.5”。

详见[美术记录](docs/art-direction.md)、[提示词](docs/hero-prompts.md)、[视觉验收](docs/visual-review.md)。About 阅读人物与静态转场已完成，素材与提示词见 [A02 记录](docs/about-prompts.md)；后续状态精修按 E05 领取；增强版发布与 VC2 由 E06 统一执行。
