# V2 双仓库发布 · 2026-10-04

用户明确授权 V2 提交、推送 Gitee 和 GitHub main；GitHub main 继续触发 Cloudflare Pages。十页页脚及新文章模板均加入 GitHub 仓库链接，原 Gitee 链接保留。

## 发布前核验

- 两个远端 main 的起点均为 `9941b7bce9713570c1fd8db84ed8178accd21ad0`，与本地原起点一致，无需改写历史。
- `browser/checks.json`：三浏览器 **64/0**。保留 V2 信息架构与透镜检查，新增全部十页在 320px、无脚本时的双仓库地址和溢出验证。
- `content-checks.json`：内容生成 **10 组通过**，新文章骨架创建及原正文保留仍成立；`--check` 通过。
- 以上浏览器报告在提交前运行，sourceCommit 为父提交，workingTree 为 true；既有本地验收与历史证据不覆盖。

提交、推送和公开核验完成后在此追加结果。实体手机、真实浏览器 UI 缩放、真实输入法和读屏仍未认证。
