# Renders all five Dino Runner videos to out\Dino-Runner-Series\ one at a time.
# Run from this folder:  powershell -ExecutionPolicy Bypass -File .\render-videos.ps1
# Finished videos are skipped, so you can safely run it again if it stops.

Set-Location $PSScriptRoot
$out = "out\Dino-Runner-Series"
New-Item -ItemType Directory -Force $out | Out-Null

$videos = [ordered]@{
  "Video1-ThinkLikeACreator" = "01 - Before We Code - Think Like a Creator"
  "Video2-HTML"              = "02 - Build the Structure - HTML"
  "Video3-CSS"               = "03 - Make It Look Like a Game - CSS"
  "Video4-JavaScript"        = "04 - Make It Come Alive - JavaScript"
  "Video5-AI-Claude"         = "05 - Build Smarter With AI - Claude"
}

foreach ($id in $videos.Keys) {
  $final = Join-Path $out ($videos[$id] + ".mp4")
  $temp  = Join-Path $out ($videos[$id] + ".rendering.mp4")
  if (Test-Path $final) { Write-Host "Skipping $id (already rendered)"; continue }
  Write-Host "`n=== Rendering $id ===" -ForegroundColor Cyan
  npx remotion render $id $temp --codec=h264 --concurrency=1 --disallow-parallel-encoding
  if ($LASTEXITCODE -eq 0) {
    Move-Item -Force $temp $final
    Write-Host "Saved $final" -ForegroundColor Green
  } else {
    Write-Host "Render of $id failed. Run the script again to retry." -ForegroundColor Red
    exit 1
  }
}
Write-Host "`nAll five videos are in $out" -ForegroundColor Green
