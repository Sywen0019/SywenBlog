# Sywen's Space

Research · Code · Life。使用原生 HTML、CSS 和 JavaScript 构建的个人网站，以漫画线稿、冷白纸面和清晰的文字阅读为基础。

**V2 已发布（2026-10-04）。** 首页、文章、研究、履历、关于构成五个主页面，文章沿用原有地址。网站运行无需框架或生产依赖；Python 仅用于内容同步和构建前检查。

- [访问网站](https://sywen-blog.pages.dev/)
- [Gitee 仓库](https://gitee.com/Sywen7777/Blog) · [GitHub 仓库](https://github.com/Sywen0019/SywenBlog)
- [线上版本信息](https://sywen-blog.pages.dev/version.json) · [V2 发布核验](docs/evidence/v2/release/README.md)

## 页面与功能

| 页面 | 内容与职责 |
|---|---|
| [首页](index.html) | Hero → Latest → Selected + Now → Off the Desk → Footer；认识作者、发现更新、进入研究与履历 |
| [文章](blog.html) | 学业／生活／我喜欢的三分类，文字档案、搜索和完整无脚本索引 |
| [研究](research.html) | Research Interests、Publications、Research Notes 三个区块 |
| [履历](profile.html) | 已确认的正式姓名、学校、专业及研究入口 |
| [关于](about.html) | 人物介绍、兴趣和学习习惯；近况链接首页的唯一 Now 来源 |
| `posts/*.html` | 文章正文、分类标签、档案编号、相邻文章及阅读增强 |

页头、页脚和快捷菜单共用五项导航；所有页面页脚同时提供 Gitee 与 GitHub 仓库入口。窄屏导航保持可见并允许换行。

- **搜索：** 标题、摘要、标签按多词 AND 匹配，可与分类组合；保留 URL 状态、中文组合输入和零结果重置。旧 `ai`、`coding`、`research` 分类参数兼容到 `study`。搜索不包含正文全文。
- **主题：** 浅色／深色切换，优先采用已保存选择，其次跟随系统；存储不可用时仍可在当前页面切换。
- **阅读：** 约 740px 阅读列、连续正文背景、阅读进度、返回顶部、复制链接与快捷菜单。
- **首页姓名：** `Sywen / LuoWenxi` 局部透镜仅在支持精细悬停指针、未启用 reduced motion 时增强；触屏、无脚本和不支持的浏览器显示静态姓名，正式身份始终可通过履历入口读取。
- **降级：** 禁用脚本仍可阅读和导航；搜索初始化失败时保留静态文章索引。核心资源本地托管，相对路径支持子目录部署。

Research Notes 显式选用真实学业文章，链接原文，不复制正文或新增分类。目前论文条目尚未整理、研究笔记尚未收录，Profile 仅展示已确认资料，Now 保留“暂未更新”。示例文章与测试样例继续明确标注。

## 本地预览

需要 Python 3.9+，无需安装前端依赖。以下命令在仓库根目录执行；Windows 使用 `py`，Linux/macOS 可替换为 `python3`。

```powershell
py scripts/sync-content.py --check
py -m http.server 8000 --bind 127.0.0.1
```

浏览器打开 [本地首页](http://127.0.0.1:8000/index.html)。修改内容来源后，先按下方流程同步。

## 内容维护与发文

| 人工维护位置 | 用途 |
|---|---|
| `content/posts.json` | 唯一文章与分类元数据来源，包括日期、标签、摘要、阅读时长及 `researchNote` |
| `content/identity.json` | Hero、Research、Profile 共用的身份与兴趣文本 |
| `content/pages.json` | 正式顶层页面清单，供构建和检查使用 |
| `posts/*.html` 的 `.post-body` | 作者维护的正文、小节、图片和正文链接 |
| `index.html` | Now 与 Off the Desk，只在首页维护 |
| `research.html` | 正式论文条目和研究方向补充说明 |

新增文章的顺序：

1. 在 `content/posts.json` 登记元数据，使用未占用的整数 id 和 kebab-case slug。
2. 运行 `py scripts/sync-content.py --new your-slug` 创建已登记、尚不存在的文章骨架。
3. 编辑文章正文，将图片放入 `assets/images/`，填写替代文本和固有尺寸。
4. 同步、检查并更新变更记录：

```powershell
py scripts/sync-content.py --write
py scripts/sync-content.py --check
```

生成器同步运行时文章数据、Latest、Blog 静态索引与分类数量、Research Notes、文章元信息、标签、编号和相邻导航。正文保持作者所有；不要手改 `js/posts-data.js` 或 `<!-- sywen:NAME:start -->` / `<!-- sywen:NAME:end -->` 之间的生成内容。

文章按首次发布日期倒序、同日 id 升序排列，A-01 等编号表示当前排序位置。`researchNote: true` 仅用于作者确认具有真实科研关联的学业文章，示例和测试样例不得收录。完整规则见 [发文与内容维护](docs/publishing.md)。

## 项目结构

```text
index.html / blog.html / research.html / profile.html / about.html
posts/                 文章 HTML
css/                   base、components、narrative、pages 四份样式表
js/                    按功能划分的经典脚本，通过 window.Sywen 共享接口
assets/                已采用的图片和 SVG 图标
content/               文章、分类、身份和页面清单
templates/post.html    新文章骨架
scripts/               内容同步、构建、检查和录制工具
docs/                  任务、契约、维护说明与历史验收证据
Change_log.md          按时间倒序的变更记录
```

`js/hero.js` 仅首页加载。样式基础与主题由 `base.css` 管理，共享控件由 `components.css` 管理，Narrative 装饰由 `narrative.css` 管理，页面构图由 `pages.css` 管理。分类小画资产保留，首页原分类独立段已撤下，Blog 保持无缩略图的文字列表。

`content/`、`templates/`、`docs/`、`参考素材/` 和美术母版不发布。页面路径、生成边界及公共接口见 [交接契约](docs/agent-handoffs.md)；视觉分层见 [视觉架构](docs/visual-architecture.md)。

## 检查与验收

V2 的既有验收结果见 [本地证据](docs/evidence/v2/README.md) 和 [发布证据](docs/evidence/v2/release/README.md)：发布前浏览器检查 64 项、内容生成 10 组、公开文件与路径 52 项、三浏览器核心 18 项均通过。历史 B/E 阶段及 E06 的报告、截图和演示保留在原目录。

内容检查只需 Python：

```powershell
py scripts/sync-content.py --check
py scripts/test-content.py
```

可选浏览器检查使用 Node.js 24、已安装的 Edge/Chrome 和本地 Playwright。首次准备：

```powershell
npm install --prefix .tmp-browser playwright@1.63.0
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.tmp-browser/browsers'
node .tmp-browser/node_modules/playwright/cli.js install firefox
```

每轮复验使用独立目录，保留历史证据：

```powershell
$V2EvidenceRoot = 'docs/evidence/v2/check-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.tmp-browser/browsers'
$env:SYWEN_EVIDENCE_DIR = "$V2EvidenceRoot/baseline"
node scripts/check-baseline.mjs
$env:SYWEN_EVIDENCE_DIR = "$V2EvidenceRoot/browser"
node scripts/check-v2.mjs
```

V2 检查覆盖页面分工、导航、响应式、主题、搜索、静态降级和姓名透镜。保留资产可用 `node docs/evidence/e01/illustration-checks.mjs --assets-only` 复验；阅读、复制与状态页专项仍在各 E 阶段目录，运行时同样设置新的 `SYWEN_EVIDENCE_DIR`。

手机视口、缩放重排和中文输入均包含模拟检查；实体手机、真实浏览器 UI 缩放、真实输入法与屏幕阅读器尚未完成实测。

## 提交与发布

保留真实、分阶段的 Git 历史。更新内容、检查和 `Change_log.md` 后提交，再推送两个 main：

```powershell
git -c http.sslBackend=openssl push origin main
git push github main
```

Gitee `origin/main` 与 GitHub `github/main` 保存源码；GitHub main 推送触发 Cloudflare Pages，执行 `bash scripts/build-site.sh` 并发布 `dist/`。构建先运行只读内容一致性检查，再按页面清单复制静态文件；缺失正式页面或内容未同步时失败。产物包含记录源提交的 `version.json` 和最小 404 页面。

Cloudflare 完成部署后核验公开版本：

```powershell
$V2ReleaseEvidence = 'docs/evidence/v2/public-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.tmp-browser/browsers'
$env:SYWEN_EVIDENCE_DIR = "$V2ReleaseEvidence/core"
node scripts/check-baseline.mjs --public
py scripts/check-release.py --expected-commit HEAD --output "$V2ReleaseEvidence/files.json"
```

部署配置、Windows 本地构建方式和发布链路见 [部署说明](docs/deployment.md)。GitHub Pages 的 `codex/pages` 为历史备选，不是当前发布入口。

## 项目文档与后续

- [V2 执行记录](docs/tasks/04-v2/README.md) · [V2 reference](docs/v2-reference.html) · [任务索引](docs/tasks/00-index.md)
- [设计规范](DESIGN_SPEC.md) · [视觉验收](docs/visual-review.md) · [美术记录](docs/art-direction.md)
- [历史规格](PROJECT_PLAN.html) · [实施基线](Plan.md) · [作业交付与历史演示](docs/delivery.md)
- [变更记录](Change_log.md) · [完整验收记录](docs/acceptance.md)

V2 聚焦信息架构和长期维护体验。更明显的排版升级、精制身份字、生活拼贴及细化动效留给 V2.x；独立 Notes/论文页面、Topic/Series、RSS、评论、订阅和框架迁移仍属 Future，按真实维护需求再评估。
