# V2 双仓库发布 · 2026-10-04

用户明确授权 V2 提交、推送 Gitee 和 GitHub main；GitHub main 继续触发 Cloudflare Pages。十页页脚及新文章模板均加入 GitHub 仓库链接，原 Gitee 链接保留。

## 发布前核验

- 两个远端 main 的起点均为 `9941b7bce9713570c1fd8db84ed8178accd21ad0`，与本地原起点一致，无需改写历史。
- `browser/checks.json`：三浏览器 **64/0**。保留 V2 信息架构与透镜检查，新增全部十页在 320px、无脚本时的双仓库地址和溢出验证。
- `content-checks.json`：内容生成 **10 组通过**，新文章骨架创建及原正文保留仍成立；`--check` 通过。
- 以上浏览器报告在提交前运行，sourceCommit 为父提交，workingTree 为 true；既有本地验收与历史证据不覆盖。
- `committed-preflight.json`：**7/0**。从实际提交提取 Linux LF 和 Windows CRLF 两种检出内容，两者只读同步通过，五篇正文的 Git 字节与 E06 起点完全相同。检查提交为 `c5e4f7c`。
- 本地构建完成，共 40 个文件；正式页面、样式、脚本和资产发布，内容来源、模板、reference 和证据不进入产物。

## 初始换行问题

`initial-checkout-checks.json` 保留首次 0/6 的结果。Windows 的 Git archive 默认使用 core.autocrlf=true 转换换行，该轮错误地将它称为 LF 检出，并把正文换行变化判为正文修改；实际正文的 Git diff 没有变化。同步失败则揭示了真实问题：生成的 JavaScript 固定 LF，而全新 Windows 检出会把它转换为 CRLF。现以 .gitattributes 对 js/posts-data.js 强制 LF，两种检出分别重测通过，没有放宽同步一致性或正文比较。

## 双仓库与公开核验（Passed）

运行时发布提交：`48355077c33ff0e25f8e5c278c4f92a4ab048b3e`。Gitee origin/main、GitHub github/main 均对齐该提交，Cloudflare Pages check-run 为 completed/success；公开 version.json 记录同一提交，发布时间为 2026-10-04T14:29:49Z。

- [public-files.json](public-files.json)：**52/0**，38 个运行文件与 Git 源字节一致，首页一致，12 个非发布/已删除路径返回 404，核验期间版本稳定。
- [public-core/public-checks.json](public-core/public-checks.json)：Edge、Chrome、Firefox 核心检查 **18/0**。
- [remote-heads.json](remote-heads.json)：两仓分支及 Cloudflare 构建状态。发布记录收尾只改文档和证据，运行文件与上述已核验提交相同；最新源提交以公开 version.json 为准。

当前十页及文章模板提供 Gitee、GitHub 链接。Cloudflare 的实际自动构建已验证 Python preflight 可用；没有声称取得具体托管 Python 版本日志。论文/经历/真实近况仍按内容边界留空，实体手机、真实浏览器 UI 缩放、真实输入法和读屏仍未认证。
