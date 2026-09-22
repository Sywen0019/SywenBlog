# E05 状态角色与局部精修

2026-09-22，本地验收。契约提交 `4c48537`，运行文件提交 `db4f13f`。E06、推送、部署及正式 VC2 不在本次范围。

## 交付与实际看图

- A09：`assets/images/a09-empty-state.webp`，320×320、26,112 字节（25.5 KiB），低于 40 KiB。母版、提示词、裁切与哈希见 [提示词记录](../../state-prompts.md)和[清单](../../state-assets.json)。
- 用户明确允许 Blog 空状态人物例外；普通文章列表无图。手机 96px、桌面 120px，图片在重置按钮之后，空 alt、aria-hidden、不可聚焦、pointer-events:none。失败时图片隐藏，不影响文案与重置。
- 实际查看全部 8 张新增空状态页面截图及修改前手机截图，角色头部、下半框眼镜、翻页动作完整；小尺寸仍有身份识别性；操作不被遮挡，无横向溢出、无页脚重叠。深色保留白色画内纸面，无反色或透明度滤镜。
- 内置 imagegen 生成 1 稿；导出只等比缩放，完整保留 alpha 和原图边界，没有额外裁去身体内容。生成稿有极轻灰色细部，视觉检查接受其在小尺寸中的表现，不宣称绝对纯黑白。

## E05 验证

`state-checks.mjs` 使用本地 HTTP 自建服务器；`before/` 与 `after/` 各 16 张图，包含正常列表／无结果 × 320／390／768／1440 × 浅深，视口高度均 900px。

| 套件 | 结果 |
|---|---|
| 修改前 Edge 截图与基础布局 | 16 通过、0 失败 |
| E05 Edge / Chrome / Firefox | 各 23 通过、0 失败，共 69 |
| 正常列表修改前后 PNG SHA256 | 8 张全部一致 |

E05 每浏览器包含 16 个布局／主题／状态场景、7 个交互和降级场景：键盘重置与焦点、分类关键词与历史恢复、中文组合输入、测试数据模拟空 favorites、图片失败、无脚本、初始化失败、子目录资源与减少动态效果。测试数据仅通过浏览器拦截修改，正式文章数据保持原样。

运行：

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.tmp-browser/browsers'
node docs/evidence/e05/state-checks.mjs
```

`--before` 只用于改动前采集；当前提交不要重新覆盖已保留的旧布局截图。修改前来源为契约提交 `4c48537`，其运行文件与领取 E05 前一致。

## 完整回归

各脚本沿用原有断言；本次报告归档在 `regression/`，原目录的历史证据保留。报告内截图名是原脚本的输出位置；E05 不重复收录这些未修改页面的回归截图，以本目录前后 32 张图作为本任务视觉证据。

| 套件 | 命令 | 结果 |
|---|---|---|
| baseline | `node scripts/check-baseline.mjs` | 179 / 0 |
| E01 | `node docs/evidence/e01/illustration-checks.mjs --browser=edge,chrome,firefox` | 三浏览器各 48 / 0，资源 12 / 0 |
| E02 | `node docs/evidence/e02/about-checks.mjs` | Edge 18 / 0 |
| E03 | `node docs/evidence/e03/reading-checks.mjs --browser=edge,chrome,firefox` | 三浏览器各 18 / 0 |
| E04 | `node docs/evidence/e04/menu-checks.mjs --browser=edge,chrome,firefox` | 三浏览器各 20 / 0 |
| Narrative | `node docs/evidence/visual/narrative-checks.mjs` | 24 / 0 |

Narrative 使用 `py -m http.server 8123 --bind 127.0.0.1` 提供本地 HTTP。E04 原检查包含鼠标点击未到达时补发合成 click 的恢复机制，本轮按原报告记录，不将其等同于实体混合输入设备验证。

## 限制

- 实体手机、真实浏览器 UI 缩放与屏幕阅读器未测；手机是视口模拟，中文输入为组合事件模拟。
- 本轮只完成 E05 局部视觉检查，不替代全站样板的用户视觉审核与 E06 正式 VC2。
- 未推送、未部署。母版在 gitignored `art-work/`，不进入发布白名单。
