# Cloudflare Pages 部署说明

修订日期：2026-09-15。本文件记录 Sywen's Space 的正式发布通路与 Cloudflare Pages 配置。

## 发布链路

```text
本地项目
   │
   ├── git push origin main   → Gitee（课程提交主仓库，完整历史）
   │
   └── git push github main   → GitHub Sywen0019/SywenBlog
                                      ↓
                               Cloudflare Pages（Git Integration）
                                      ↓
                               bash scripts/build-site.sh
                                      ↓
                                   dist/
                                      ↓
                                https://<project>.pages.dev
```

- 本地仓库同时保留两个 remote：`origin` → Gitee，`github` → GitHub。两者互不覆盖。
- Cloudflare Pages 只连接 GitHub 仓库的 `main` 分支，不使用手工 `Upload assets`。
- 仓库本身没有构建依赖（无 `package.json`、无 npm、无框架）；`dist/` 只是发布用的白名单拷贝。

## 一、本地构建

```bash
bash scripts/build-site.sh
```

Windows 上 `bash` 来自 Git for Windows（例如 `Z:\Git\Git\bin\bash.exe`），不要使用未安装发行版的 WSL 存根。

脚本行为：

1. 删除并重建 `dist/`；
2. 校验 `index.html` 存在，否则以非零状态退出；
3. 复制顶层页面 `index.html`、`blog.html`、`about.html`；
4. 复制运行时目录 `css/`、`js/`、`posts/`、`assets/`（缺失则跳过并记录，不视为失败）；
5. 打印构建日志，例如：

```text
[build] cleaning dist
[build] copying html
[build] not publishing: PROJECT_PLAN.html
[build] copying css
[build] copying js
[build] copying posts
[build] copying assets
[build] done: 20 files in dist/
```

`dist/` 由构建过程生成，**不提交到 Git**（`.gitignore` 中的 `/dist/`），也不手工长期维护。
`scripts/build-site.sh` 的换行由 `.gitattributes` 固定为 LF，避免 Windows 下 CRLF 导致脚本无法执行。

### 新增页面时

顶层页面是显式白名单（脚本中的 `PAGES`）。新增顶层页面后必须同步加入该列表；若忘记，构建日志会输出 `[build] not publishing: <文件名>` 作为提醒。
`posts/` 下新增文章无需修改脚本，整目录会被复制。

### 不发布的内容

`docs/`、`参考素材/`、`art-work/`、`AGENTS.md`、`DESIGN_SPEC.md`、`Plan.md`、`Change_log.md`、`PROJECT_PLAN.html`、测试截图与 Agent 证据均不会进入 `dist/`。

## 二、Cloudflare Pages 项目配置

创建方式：**Workers & Pages → Create → Pages → Connect to Git**，授权 GitHub 后选择仓库。

| 字段 | 填写值 |
|---|---|
| Git 平台 | GitHub（Git Integration） |
| Repository | `Sywen0019/SywenBlog` |
| Production branch | `main` |
| Framework preset | `None` |
| Root directory (advanced) | 留空（未填写即视为仓库根目录；如 UI 强制填写则填 `/`） |
| Build command | `bash scripts/build-site.sh` |
| Build output directory | `dist` |
| Environment variables | 不需要 |

说明：

- 构建环境为 Ubuntu 22.04 x86_64，自带 `bash` 与 coreutils。
- 仓库根目录没有 `package.json`，不会触发依赖安装。
- 不需要 `.nojekyll`、`_redirects`、`_headers`，也不需要 Workers 或 Functions。
- 首次部署会分配 `https://<project>.pages.dev`，自带 HTTPS。
- GitHub 上还存在旧镜像分支 `codex/pages`，其中没有 `scripts/build-site.sh`。建议在 **Settings → Builds & deployments → Preview deployments → Branch control** 选择 `None`（或 Custom branches 只保留 `main`），避免该分支产生失败的预览构建。

## 三、日常发布流程

```bash
git add <改动文件>
git commit -m "feat: ..."
git push origin main    # Gitee：课程提交
git push github main    # GitHub → Cloudflare Pages 自动构建
```

推送 `main` 到 GitHub 后，Cloudflare Pages 会自动执行构建并发布 `dist/`。

本机默认 TLS 后端可能报 `schannel: AcquireCredentialsHandle failed`，此时按 README 的记录改用 OpenSSL 后端：

```bash
git -c http.sslBackend=openssl push origin main
```

只修改全局 Git TLS 配置以外的方式处理，不要改动 remote 地址，也不要使用 `git push --force`。

## 四、部署验收要点

- 构建日志以 `[build] done:` 结束，Cloudflare 部署状态为成功。
- 线上 `index.html`、`blog.html`、`about.html`、`posts/` 四篇文章均可访问。
- CSS、图片、favicon、JS 全部 200，无 404 静态资源。
- 资源路径全部为相对路径，Cloudflare 与子目录部署均可用；Linux 文件系统区分大小写，引用与文件名大小写必须一致。
