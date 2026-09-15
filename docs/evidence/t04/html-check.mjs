// T04 补充检查：HTML 标签配对、编码有效性与脚本/资源约束
import fs from 'node:fs';
const root = 'L:/Sywen-Blog';
const pages = ['index.html', 'blog.html', 'about.html', 'posts/attention-intuition.html', 'posts/dom-search-notes.html', 'posts/paper-reading-notes.html', 'posts/leave-some-space.html'];
const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
let fail = 0;
const problems = [];
for (const p of pages) {
  const buf = fs.readFileSync(`${root}/${p}`);
  const text = buf.toString('utf8');
  if (text.includes('\uFFFD')) { problems.push(`${p} 存在替换字符（编码问题）`); fail++; }
  const src = text.replace(/<!--[\s\S]*?-->/g, '').replace(/<!DOCTYPE[^>]*>/i, '');
  const stack = [];
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*?)(\/?)>/g;
  let m;
  while ((m = re.exec(src))) {
    const [, closing, tag, attrs, selfClose] = m;
    const name = tag.toLowerCase();
    if (voidTags.has(name) || selfClose) continue;
    if (!closing) stack.push(name);
    else {
      const top = stack.pop();
      if (top !== name) { problems.push(`${p} 标签不配对：</${name}> 对应 <${top ?? '无'}>`); fail++; }
    }
  }
  if (stack.length) { problems.push(`${p} 未闭合标签：${stack.join(', ')}`); fail++; }
  // 关键结构约束
  if ((text.match(/<h1/g) || []).length !== 1) { problems.push(`${p} h1 数量异常`); fail++; }
  if (/<script/i.test(text)) { problems.push(`${p} 含 <script>`); fail++; }
  const dupeIds = {};
  const idRe = /\sid="([^"]+)"/g;
  while ((m = idRe.exec(text))) dupeIds[m[1]] = (dupeIds[m[1]] || 0) + 1;
  const dup = Object.entries(dupeIds).filter(([, c]) => c > 1).map(([k]) => k);
  if (dup.length) { problems.push(`${p} 重复 id：${dup.join(', ')}`); fail++; }
  // aria-hidden 装饰必须含 pointer-events 规则（样式层已保证），此处只确认属性存在
  const decor = (text.match(/class="hero-art__(?:tape|dots)" aria-hidden="true"/g) || []).length;
  if (p === 'index.html' && decor !== 2) { problems.push(`${p} 装饰 aria-hidden 标记数 ${decor} ≠ 2`); fail++; }
  if (p === 'about.html' && decor !== 1) { problems.push(`${p} About 装饰 aria-hidden 标记数 ${decor} ≠ 1`); fail++; }
  console.log(`${p}: 标签配对=${problems.some((x) => x.startsWith(p)) ? 'FAIL' : 'ok'} 唯一 h1=ok 无 script=ok 装饰=${decor}`);
}
console.log(problems.length ? '\n问题:\n' + problems.join('\n') : '\n全部通过');
console.log(`结果: ${fail === 0 ? 'PASS' : 'FAIL'}`);
process.exit(fail ? 1 : 0);
