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
    "slug": "attention-intuition",
    "title": "用直觉理解注意力机制",
    "summary": "从阅读一句话时如何寻找线索出发，理解 Query、Key 和 Value 的分工。先建立加权汇总的直觉，再区分这个比喻能解释什么、不能解释什么。",
    "category": "study",
    "tags": [
      "AI",
      "Transformer",
      "学习笔记"
    ],
    "date": "2026-09-15",
    "url": "posts/attention-intuition.html",
    "isDemo": true,
    "readingTime": 2
  },
  {
    "id": 2,
    "slug": "dom-search-notes",
    "title": "原生 JavaScript 搜索与筛选笔记",
    "summary": "用一个小型文章列表拆解搜索流程：整理数据、组合条件、创建 DOM，再处理中文输入与失败降级。让交互保持简单，也让没有脚本的页面依然可读。",
    "category": "study",
    "tags": [
      "JavaScript",
      "DOM",
      "前端"
    ],
    "date": "2026-09-15",
    "url": "posts/dom-search-notes.html",
    "isDemo": true,
    "readingTime": 2
  },
  {
    "id": 3,
    "slug": "paper-reading-notes",
    "title": "一次论文阅读如何留下可复用笔记",
    "summary": "把论文笔记从摘抄改成问题、证据与局限的连接。通过三次阅读逐步建立地图，保留页码和图号，为下一次验证、复现与讨论留下入口。",
    "category": "study",
    "tags": [
      "论文阅读",
      "科研",
      "笔记"
    ],
    "date": "2026-09-15",
    "url": "posts/paper-reading-notes.html",
    "isDemo": true,
    "readingTime": 2
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
  }
];
})();
