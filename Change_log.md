# Change Log

按时间倒序记录项目变更：日期、变更摘要与验证结果。功能与验收依据见 [PROJECT_PLAN.html](PROJECT_PLAN.html)、[DESIGN_SPEC.md](DESIGN_SPEC.md) 与 [Plan.md](Plan.md)。

## 2026-09-15 · Stage 0 执行基线与工程准备（T00）

- 新增执行记录：`docs/agent-handoffs.md`（任务状态、DOM 与路径契约、未验证项）、`docs/acceptance.md`（阶段验收、外部阻塞、已知问题）、`docs/visual-review.md`（VC1／VC2 检查点容器）。
- `README.md` 更新为当前真实状态：阶段进度、实际目录、本地 HTTP 预览方式、执行记录入口、仓库与推送说明。
- `AGENTS.md` 修正过时事实：参考素材由“四张”更正为五张；删除“应用目录尚不存在”与“无 Git 历史”的旧描述；补充 `docs/` 记录说明与“增强控件默认 `hidden`、由脚本显示”的约定。
- `.gitignore` 新增发布目录／打包产物（`/release/`、`/dist/`、`*.zip`）与编辑器缓存排除项。
- 验证：五张参考 PNG 的 SHA256 与基线一致（未改动）；`git -c http.sslBackend=openssl ls-remote origin` 返回 `refs/heads/main`；新增文件与跟踪文件中未发现凭据；`docs/` 与 `参考素材/` 未被忽略规则误伤。
- 未验证：Netlify 账号与公开 HTTPS 条件（外部阻塞，见 `docs/acceptance.md` OB-02）；Git 推送认证（OB-01）。
