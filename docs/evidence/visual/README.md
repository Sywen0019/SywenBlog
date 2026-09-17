# 视觉架构重构证据：Visual Vertical Slice

日期：2026-09-18。基础版本 `6c454f2`（E02 之后）。契约见 [docs/visual-architecture.md](../../visual-architecture.md)。

## 输入与范围

本轮只实现用户确认的样板区域：Header、Home Hero／Recent／Categories／Now、Blog Header＋筛选＋条目、About 各区块、Article Header＋正文 rail、Footer。**没有铺开全部页面**（Phase 4 待样板通过）。

## 文件

- `reference/`：改动前的对照截图（40 张），标签 `before`。
- `after/`：样板完成后的截图（40 张），标签 `after`。
- 两组各含 `capture.json`，记录每张图的视口宽度、主题、文档高度与是否横向溢出。
- `capture.mjs`：截图矩阵脚本。需本地 HTTP 服务（默认 `http://127.0.0.1:8123/`）与仓库内被忽略的 Playwright 安装。
- `narrative-checks.mjs` / `narrative-checks.json`：Narrative 契约检查。
- `narrative-report.txt`：检查输出的纯文本记录。

## 矩阵覆盖

| 维度 | 取值 |
|---|---|
| 页面 | Home、Blog、About、Article（`posts/attention-intuition.html`） |
| 视口 | 1440、1200、1024、768、390 |
| 主题 | 浅色、深色 |
| 合计 | 40 张／组，共 80 张 |

## 结果

- **Narrative 契约 22/22 通过**：每个 Narrative 元素都有 `aria-hidden` 祖先、不可聚焦且不含可聚焦元素、`pointer-events` 解析为 `none`、不与任何交互元素重叠。
- **Article 阅读列**：Post 页 Narrative 元素全部位于 740px 阅读列之外（bounding box 断言）。
- **Blog**：动态列表 `img` 数为 0，条目数为 4，结果计数为「找到 4 篇文章」；`life` 筛选返回 1 条且编号仍为 `A-04`；重置回到 4 条；无脚本静态列表 4 条、0 张图、4 个可见链接。
- **横向溢出**：40 张截图全部 `overflow=false`。
- **文档高度对照**（浅色，单位 px）：

| 页面 | 1440 before → after | 390 before → after |
|---|---:|---:|
| Home | 2297 → 2488 | 2853 → 2478 |
| Blog | 1947 → 1609 | 2056 → 2056 |
| About | 1863 → 2285 | 2669 → 2996 |
| Article | 2237 → 2376 | 2977 → 3074 |

Home 手机端变矮，因为分类小画由固定 96×72 缩略改为通栏 4:3，同时去掉了卡片外框；Blog 变矮是因为取消缩略图。

## 回归

| 套件 | 结果 |
|---|---|
| `scripts/check-baseline.mjs` | 161 / 0 |
| `docs/evidence/e01/illustration-checks.mjs`（Firefox） | 48 / 0 |
| `docs/evidence/e03/reading-checks.mjs`（Firefox） | 18 / 0 |
| `docs/evidence/e04/menu-checks.mjs`（Firefox） | 20 / 0 |

E01、E03 已按新契约更新（Blog 取消缩略图；页脚底部基线 32px → 64px）。

## 未验证

- 未使用实体手机、屏幕阅读器与真实浏览器 UI 缩放。
- `page-rail` 的固定 1200px 断点未经视觉审核确认，仍属原型。
- 观感类判据（Editorial Notebook 是否成立、mark 是否过于工程化、纸签是否过多、Article 是否过装饰、Blog 是否有 sidebar／dashboard 感）属于用户视觉审核，不在此文件宣告通过。
