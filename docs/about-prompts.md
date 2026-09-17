# A02 提示词与生成记录

最终采用候选 3：`art-work/about/candidate-3.png`，同字节复制为 `selected.png`。原始输出：Codex `generated_images/01a0ad1a-1552-7f21-8ea2-e8dcd5d705f0/exec-f43f96d5-82c1-47e9-a1ee-3c5da0001cd6.png`。候选 1/2 工具输出分别为 `exec-b8a0f5de-3097-4c28-850d-d9b623925f1f.png`、`exec-a9227119-5908-4b88-976d-bd5ef75e5388.png`。全部母版不上线，最终 SHA256 见 about-assets.json。

## 候选 3 定向修订实际提示词

```text
Edit this accepted clean line illustration ONLY to expand its paper margins. Preserve all existing face, short hair, cowlick, red LOWER-half-rim glasses (no red upper rims), plaid shirt, relaxed seated tablet reading pose, head/eyes directed at tablet, hands and tablet exactly. Zoom out by approximately 20 percent on a 4:3 landscape canvas: leave at least 10 percent blank pure opaque white paper ABOVE the highest cowlick, 10 percent below the lap silhouette, and safe side margins. Finish the simple chair/lap lower outline naturally within the canvas. Clean black outlines, very sparse hatching, white object interiors. No gray shading, no wash, no gradient, no transparency, no text. Do not redesign or add props.
```

候选 2：不透明纸底、人物、手部、下半框与线稿通过初检，但顶部留白仍不足约 10%，继续仅扩展边缘。

## 候选 2 定向修订实际提示词

```text
Edit the first image into a clean finished standalone manga ink illustration. Keep the same character identity, seated tablet-reading pose, facial proportions, checked shirt, hands, and red LOWER-half-rim glasses with NO RED UPPER RIMS. Reference image 2 is identity only, reference image 3 is clean linework only. Correct two defects: (1) output must be completely OPAQUE RGB-looking warm white paper, including background and ALL interiors of face, hair, shirt, hands and tablet; no transparency, no holes, no dark/gray fill or wash, no noise or speckled textures. Draw clean black outlines and sparse fine lines on plain white paper, with fine red lines ONLY on the lower glasses rims and temples. (2) pull camera back so the whole figure is smaller, centered with at least 10% clear paper margin above the entire cowlick and around sides, complete hands and tablet. Keep upper body and lap, chair can end naturally below lap. 4:3 landscape canvas. Do not add text, props or UI. Do not thicken lines or change facial identity. Head and eyes look down toward tablet.
```

候选 1：阅读动作与下半框方向可用，但顶边安全区不足，RGBA 输出存在异常透明区域；不采用。

2026-09-17；工具：Codex 内置 image_gen。工具未提供可核实的底层模型版本，不推测型号。

参考 1：`参考素材/角色三视图.png`，唯一角色身份依据。参考 2：`assets/images/hero-desk-1280.webp`（Hero J），仅画法参考。原始输出与候选保存于 gitignored `art-work/about/`。

## 候选 1 实际提示词

```text
Use case: illustration-story. Asset: standalone 4:3 About reading character illustration, not a webpage.
Image 1 is the ONLY character identity reference, a three-view character sheet. Image 2 is ONLY the adopted Hero linework reference.
Show this same short-haired character with ahoge cowlick, same facial proportions and checked button-up shirt, sitting comfortably on a simple barely indicated chair, upper body and lap, holding one plain tablet naturally with BOTH hands and reading its screen. Head gently inclined and both eyes directed toward the tablet, relaxed shoulders and elbows, anatomically plausible hands supporting opposite lower sides of tablet. Three-quarter view allowing BOTH lenses to be clearly legible. Tablet screen faces character, viewer sees mostly clean outline of back. No desk, laptop, plants or extra props.
CRITICAL glasses: RED LOWER HALF RIMS ONLY. Red line along bottom of each lens and short lower side edges, open upper lens edges with NO red top bar, NO full rectangular frames. Maintain reference identity, not a different person.
Black ink outlines and very sparse hatching on clean warm off-white paper. All hair, shirt checks, tablet surfaces and chair interiors remain paper-white, no grey fill, no shading wash, no gradients, no solid colored areas or heavy shadows. Red fine glasses lines are the ONLY color exception. Airy editorial manga line art like reference 2.
Landscape 4:3 composition, full head and cowlick, both hands and complete tablet safely inside central 80 percent. Include entire upper body, natural lap crop well below hands; at least 10 percent empty margin around top and sides, no cut-off hands or device. No lettering, titles, text, logos, buttons, watermark or UI.
```
