# Hero 半框眼镜与纯线稿修正 · 2026-09-16

## 当前结果

本地采用 J：红色下半框，上方敞开；电脑、键盘、平板、手写笔及植物为线条与留白。已逐图放大核对三视图眼镜，不以“红色矩形”作为身份判断。D/E/F/G/H整图的通过/采用结论撤回；此前功能验收属于历史版本。

母版：art-work/hero/candidate-j.png；正式网页导出：assets/images/hero-desk-640.webp、hero-desk-1280.webp。原始工具输出保留，使用内置出图，无API回退或程序重画。参考特写裁切只为看图与提示，网页导出只等比缩小。

## 实际过程与额度

- A–D：此前4次出图，D低头书写，但镜框与涂色错误。
- E：线稿改善，眼镜仍错；F/G重复整图编辑仍残留上沿线。
- H-face：局部特写成功；H回填完整图又生成上沿线，未采用。
- I第一次调用额度失败，未得到图；额度恢复后从正确特写向外扩展得到I，眼镜正确但头顶被裁。
- J：扩展I边缘，保留正确半框，完整头部及书桌。累计11次成功生成，另1次失败，超过原预估；不将失败稿伪报通过。

## 验收与发布边界

四种1440/390浅深局部截图与检查放在 docs/evidence/hero-lineart-j/；放大查看两片镜片上方均无连接框线。设备不再有色块、灰面涂抹。画面保持低头看平板；手机角色和红色下缘可辨。旧E截图仅布局检查，不能代表美术合格。

本轮只接入本地Hero。当前分支还含其他任务的本地阅读/菜单增强，因此不推送或触发整站部署，不移动coursework-baseline标签。用户看到的线上版本仍是旧D。

## I 提示词（正确特写向外扩展）

Zoom out / extend this corrected face close-up into a 4:3 landscape desk illustration. Preserve EXACT glasses geometry from the reference: red OPEN-TOP squared U-shaped LOWER HALF rims. The upper edges have NO line, no transparent lens edge outline, no red or gray top segment. Do not close either U into a rectangle. Keep red temples and nose bridge, short light bob, ahoge, downward gaze. Seated character in plaid shirt writing with a digital stylus on a tablet; substantial open laptop with keyboard at left, single small leafy plant at right. All upper body and both hands visible. Head has breathing room and face large enough for glasses to read. Character looks down toward stylus tip contacting tablet. Fine manga line-art ONLY on white: thin contours, white interiors in laptop, keycaps, tablet screen and bezel, stylus barrel, plant leaves, clothes. Plaid drawn using thin intersecting lines. No gray filled regions, painted shading, smudges, gradients, dense hatch fields or colored objects. ONLY red marks are lower eyeglass rims/temples/bridge. Do not add text, logo, watermark, paper notebook. Keep the reference face and its open-top glasses, extend around it; do not redesign glasses.

## J 最终提示词（补足构图边缘）

Outpaint this exact illustration to a slightly wider 4:3 desk composition. Pull the camera back about 20%, extending the canvas content around all sides so the ENTIRE head, ahoge and hair have clear 6% white headroom, laptop is fully legible at left and plant pot at right is contained. Keep the existing image content and facial details unchanged, especially the correct red OPEN-TOP LOWER HALF eyeglass rims: the upper edges are absent, never draw a new line across the top of either lens. Preserve face, downward gaze, hand pose, stylus touching tablet, plaid linework and desk setup. Only add the missing peripheral head/desk/device/plant contours needed for the wider framing. Same clean thin black manga contour art on white; devices and plant white inside, no shading, gray fills, color or textures. Only glasses rims/temples/bridge red. No text, no new objects, no eye contact, no redesigned glasses. One complete 4:3 landscape illustration.
