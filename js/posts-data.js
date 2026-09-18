(function () {
  'use strict';
  const site = window.Sywen = window.Sywen || {};
  // mark 对应 assets/icons/marks.svg 中的 symbol id；note 是分类的短辅助描述。
  site.categories = [
  {
    "id": "study",
    "name": "学业",
    "image": "assets/images/cat-study.webp",
    "mark": "book-stack",
    "note": "课程、笔记与慢慢弄懂的概念。"
  },
  {
    "id": "life",
    "name": "生活",
    "image": "assets/images/cat-life.webp",
    "mark": "coffee",
    "note": "日常节奏、手账与留白。"
  },
  {
    "id": "favorites",
    "name": "我喜欢的",
    "image": "assets/images/cat-favorites.webp",
    "mark": "flower",
    "note": "美食、动漫与游戏里的偏爱。"
  }
];
  site.posts = [
  {
    "id": 1,
    "slug": "ncs-figure-design",
    "title": "ncs-figure-design 的设计思路",
    "summary": "科研绘图的风格不该来自一组没有出处的默认参数。这套 skill 从官方指南、真实论文图和学术色板文献中学习，并把来源、校验与诚实降级写进工作流。",
    "category": "study",
    "tags": [
      "ncs-figure-design",
      "科研绘图",
      "视觉规范"
    ],
    "date": "2026-09-18",
    "url": "posts/ncs-figure-design.html",
    "isDemo": false,
    "readingTime": 4
  },
  {
    "id": 2,
    "slug": "research-reading",
    "title": "research-reading 的设计思路",
    "summary": "论文伴读不应该自动替研究者总结。这套 skill 用低负担的三遍阅读、六类证据标记和材料边界，陪读者形成可靠、可追溯、有适用边界的理解。",
    "category": "study",
    "tags": [
      "research-reading",
      "论文阅读",
      "科研工作流"
    ],
    "date": "2026-09-18",
    "url": "posts/research-reading.html",
    "isDemo": false,
    "readingTime": 4
  },
  {
    "id": 5,
    "slug": "deskmate-with-firefly",
    "title": "和流萤做同桌",
    "summary": "如果是和流萤一起做同桌的话，再读高中三年也不是不行。放两只流萤手办的照片，顺便记下关于南华、清华和上交的玩笑。",
    "category": "favorites",
    "tags": [
      "崩坏：星穹铁道",
      "流萤",
      "手办"
    ],
    "date": "2026-09-18",
    "url": "posts/deskmate-with-firefly.html",
    "isDemo": false,
    "readingTime": 1
  },
  {
    "id": 4,
    "slug": "leave-some-space",
    "title": "给学习留一点空白",
    "summary": "计划里没有排满的时间，也可以有自己的用途。用一页简单的手账区分推进、整理与休息，让学习留下回顾的空间，而不是只累积待办。",
    "category": "life",
    "tags": [
      "生活",
      "学习",
      "手账"
    ],
    "date": "2026-09-15",
    "url": "posts/leave-some-space.html",
    "isDemo": true,
    "readingTime": 2
  },
  {
    "id": 6,
    "slug": "scrna-grn-notes",
    "title": "六月：单细胞与基因调控网络笔记",
    "summary": "从单细胞 RNA 测序数据的稀疏与噪声讲起，再逐条整理基因调控网络推断里的常见概念：先验知识、贝叶斯网络、高斯图模型、L1 正则化与图自编码器。",
    "category": "study",
    "tags": [
      "单细胞测序",
      "基因调控网络",
      "学习笔记"
    ],
    "date": "2025-06-27",
    "url": "posts/scrna-grn-notes.html",
    "isDemo": false,
    "isTestSample": true,
    "readingTime": 8
  }
];
})();
