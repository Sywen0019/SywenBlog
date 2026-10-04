# V2 本地候选验收 · 2026-10-04

源父提交：9941b7b。本轮使用未提交工作区；没有推送或公开部署。报告的 sourceCommit/baseCommit 表示父提交，运行文件的实际哈希以本轮报告和 build-checks.json 为准，不能据此宣称公开版本已是 V2。

| 检查 | 结果 | 证据 |
|---|---|---|
| 内容生成行为 | 10 组通过（包含多场景子项） | scripts/test-content.py、content-checks.json |
| 原正文保留 | 五篇正文原字节相同；reference 原样保留 | body-preservation.json |
| 基线浏览器 | 215/0；最终核心复验 18/0 | baseline/checks.json、final-core/checks.json |
| V2 三浏览器 | 61/0 | browser/checks.json |
| E01 保留资产 | 12/0 | e01/asset-checks.json |
| E02 人物和降级 | 18/0 | e02/after/checks.json |
| E03 阅读 | 三浏览器各 18/0 | e03/reading-checks-*.json |
| E04 菜单和复制 | 三浏览器各 20/0 | e04/menu-checks-*.json |
| E05 状态页 | 69/0；正常列表当前 before/after 像素一致 | e05/after-checks.json |
| Narrative | 53/0 | narrative/narrative-checks.json |
| 纸面 | 168/0 | paper/checks.json |
| 构建产物 | 40 文件，发布范围及源字节匹配 | build-checks.json |

## 覆盖与看图

V2 检查覆盖五页导航、Home 五段顺序、Selected 锚点、Research 空状态、Profile 身份、About 单一近况来源、静态/动态一致、固定搜索样例、透镜像素变化及空闲帧数、运行中切换 reduced motion、触屏/无脚本/遮罩不支持/脚本失败、子目录和照片失败。三浏览器、五宽度、浅深主题；基线另外检查断点两侧及所有文章。透镜脚本约 1.9KB，不使用渲染库或持续动画循环。

实际查看：Home 桌面浅色与手机深色、Research 手机浅色、Profile 桌面深色、About 手机浅色、Blog 手机深色和姓名局部透镜。人物与照片保持原色，手机 Selected 在 Now 前，正式姓名入口清晰。没有声称逐张人工看完所有截图，也没有把这次本地看图等同于公开 VC2。

## 历史证据与初始失败

- initial-browser-checks.json 保留一次 20/1 的检查：媒体查询变化后立即模拟下一次移动存在测试时序问题。等待查询事件完成后重新移动，最终三浏览器均通过。第一轮还修正了检查中受 motion 类影响的类名比较及静态排版空白比较。
- Firefox 禁用页面脚本时异步图片解码/定时器等待会挂起，V2 harness 的无脚本场景使用静态导航和内容断言，不在该场景等待页面异步任务；有脚本场景仍检查图片完整性。
- Narrative 初次 48/5 把阈值前不可见的返回顶部按钮当成可见目标。修正可见性判定，E03 继续检查按钮显示后的页脚避让；最终 53/0，没有放宽实际可见内容的几何断言。
- E03 的历史 E01 像素基线尺寸与 V2 不同，仅记录有意的导航和 Blog 布局变化；1–17 项功能断言全部执行。E05 使用独立 V2 before 做正常列表确定性比较，不重写历史 PNG。

## 复现与限制

发文和核心命令见 ../../publishing.md。各专项运行前将 SYWEN_EVIDENCE_DIR 设置到本目录对应子目录，避免覆盖历史证据；Narrative 需要先在 127.0.0.1:8123 提供本地 HTTP。

未实测实体手机、真实浏览器 UI 缩放、屏幕阅读器、真实中文输入法或混合指针设备。视口、组合事件和触屏均为浏览器模拟。Python 3 的正式托管环境版本仍需发布前确认。论文、正式经历和真实近况未补造；当前 Research Notes 全部未收录。
