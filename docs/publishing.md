# 发文与内容维护 · V2

更新时间：2026-10-04。运行时仍为原生 HTML/CSS/经典 JavaScript，无生产依赖。Python 3.9+ 只用于本地内容同步及构建前检查；没有浏览器端 JSON 请求。

## 来源与输出

| 人工来源 | 维护内容 | 生成输出 |
|---|---|---|
| content/posts.json | 分类；文章 id、slug、title、summary、category、tags、date、isDemo、readingTime；可选 isTestSample、researchNote | js/posts-data.js、Blog 静态索引与分类计数、Home Latest、Research Notes、文章受管区域 |
| content/identity.json | 昵称、正式姓名、透镜字样、学校、专业、兴趣、英文短句 | Hero、Profile、Research 的共用身份与兴趣文本 |
| content/pages.json | 五个正式顶层页面 | 构建白名单、当前测试页面枚举 |
| posts/*.html | .post-body 内的正文、小节、图片、表格、正文链接；生成区域之外的人工内容 | 正文保留原字节 |
| index.html | Now 和 Off the Desk | 只在此处维护 |
| research.html | Publications 正式条目与补充说明 | Profile 仅链接，不复制论文列表 |

不要手改生成的 posts-data 或 `<!-- sywen:NAME:start -->` / `<!-- sywen:NAME:end -->` 之间的内容。生成器验证所有输入和本地引用后才写入；标记缺失、重复、交错或覆盖正文时失败。

## 新增一篇文章

1. 在 content/posts.json 的 posts 数组登记一条。id 取现有最大值 + 1（保留旧 id，不要求连续）；slug 用小写 kebab-case。url 不必填写，自动推导为 posts/slug.html。
2. 创建骨架：`py scripts/sync-content.py --new your-slug`。只允许登记后尚不存在的文件；会同时同步索引和相邻导航，不覆盖既有文章。
3. 在新文件的 .post-body 内撰写正文。小节沿用 h2[data-rail] 和 aria-hidden 的 .post-section-number；图片放入 assets/images 并填写固有尺寸和准确 alt。
4. 完成后运行 `py scripts/sync-content.py --write`，再运行 `py scripts/sync-content.py --check`。日期必须有效，阅读时长由作者维护，分类仍为 study/life/favorites。
5. 运行内容行为测试及受影响浏览器检查，更新 Change_log。所有生成变化应和元数据、正文一起进入后续审阅的提交。

修改现有标题、摘要、日期、标签和时长时只改 JSON，再同步。仅修改正文无需同步；若改了元信息仍需 --write。移除文章时同时移除 metadata 和正文，并处理指向它的人工链接，生成器会指出断链。

正文不自动计算字数或阅读时长，不转换 Markdown，不从标题/标签猜测科研归属。无脚本静态索引与浏览器动态索引来自同一 metadata。

## 顺序与 Research Notes

- 全站按首次发布日期倒序、同日 id 升序。Latest 取前三篇。
- A-01 等编号是当前排序位置，筛选不换号；编号、标签和「下一篇 · 更新／上一篇 · 更早」全部自动同步。长期身份为 slug 和文章 URL。
- `researchNote: true` 只能用于真实、非示例、非测试样例的 study 文章。作者确认与实际科研活动直接相关后再开启；当前三篇学业文章均未收录。
- Research Notes 使用同一原 URL、排序和全站编号，不创建正文副本，不增加第四分类，不改变旧 ?category=research 到 study 的兼容行为。

## 正式论文与个人信息

论文只在 Research 的 Publications 区块维护，按年份由近到远。每项用普通标题链接和两行文本表达 Title、完整 Authors、Journal、Year；本人署名按核实后的实际作者形式加粗。标题链接 DOI 或期刊官方页面，不使用贡献标签、摘要或卡片。

目前公开条目尚未整理，不能把空状态改写成“尚未发表”。Profile 的教育时间、经历、项目、技能、奖项、联系方式只在获得真实资料后增加。Now 未提供最新状态时保留“暂未更新”，不要复制 About 或旧文案作为当前事实。

## 检查与发布准备

```powershell
py scripts/sync-content.py --check
py scripts/test-content.py
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.tmp-browser/browsers'
$env:SYWEN_EVIDENCE_DIR = 'docs/evidence/v2/baseline'
node scripts/check-baseline.mjs
$env:SYWEN_EVIDENCE_DIR = 'docs/evidence/v2/browser'
node scripts/check-v2.mjs
```

生成行为测试使用隔离临时目录，不修改正式内容。网站无需 Node；浏览器检查沿用忽略目录内的 Playwright。

构建前执行只读 --check，并从 content/pages.json 读取白名单，再复制 HTML/css/js/posts/assets。content、templates、docs、参考素材和 art-work 不发布。构建不会替作者改写过期生成区域；发现不同步即退出。Windows 用 Git Bash 构建，必要时设置 SYWEN_PYTHON 指向 Python 3。

正式发布通路仍是 GitHub main → Cloudflare Pages；Gitee 保留完整源码历史。公开核验从 version.json 指向的提交读取页面清单并逐文件比较。当前本地 V2 未提交或部署；公开站仍以最新 E06 发布记录为准。
