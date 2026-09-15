// 网点像素复测（ASCII 兼容输出）：从截图测量网点颜色、大小与间隔
// 用法：node - --file=<png> --rect=x,y,w,h [--paper=R,G,B]
import { execFileSync } from 'node:child_process';

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const [k, ...v] = a.replace(/^--/, '').split('=');
  return [k, v.join('=')];
}));
const file = args.file;
const [rx, ry, rw, rh] = (args.rect || '0,0,0,0').split(',').map(Number);
const paper = (args.paper || '247,243,234').split(',').map(Number);

const ps = `
Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile('${file}')
$pap = @(${paper.join(',')})
$rows = @()
$colors = @{}
for ($y = ${ry}; $y -lt ${ry + rh}; $y++) {
  $line = ""
  for ($x = ${rx}; $x -lt ${rx + rw}; $x++) {
    $c = $bmp.GetPixel($x, $y)
    $d = [Math]::Max([Math]::Abs($c.R - $pap[0]), [Math]::Max([Math]::Abs($c.G - $pap[1]), [Math]::Abs($c.B - $pap[2])))
    if ($d -eq 0) { $line += "." } else { $line += "#" }
    $key = "$($c.R),$($c.G),$($c.B)"
    if ($colors.ContainsKey($key)) { $colors[$key] = $colors[$key] + 1 } else { $colors[$key] = 1 }
  }
  $rows += $line
}
Write-Output ("FILE {0}" -f '${file}')
Write-Output ("REGION ({0},{1}) {2}x{3} PAPER {4}" -f ${rx}, ${ry}, ${rw}, ${rh}, ($pap -join ','))
$ink = 0
foreach ($r in $rows) { $ink += ([regex]::Matches($r, '#')).Count }
Write-Output ("INK PIXELS {0} of {1} ({2}%)" -f $ink, (${rw} * ${rh}), [Math]::Round(100.0 * $ink / (${rw} * ${rh}), 2))
Write-Output "PROFILE (first 40 rows):"
$n = 0
foreach ($r in $rows) {
  if ($n -lt 40) { Write-Output ("  y={0} |{1}|" -f (${ry} + $n), $r) }
  $n++
}
Write-Output "COLOR HISTOGRAM:"
foreach ($k in ($colors.Keys | Sort-Object { -$colors[$_] })) { Write-Output ("  rgb({0}) = {1}" -f $k, $colors[$k]) }
$bmp.Dispose()
`;
const out = execFileSync('powershell.exe', ['-NoProfile', '-Command', ps], { encoding: 'utf8', maxBuffer: 1 << 26 });
console.log(out);
