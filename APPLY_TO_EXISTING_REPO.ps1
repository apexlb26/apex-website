param(
  [Parameter(Mandatory = $true)]
  [string]$TargetRepo
)

$ErrorActionPreference = "Stop"
$Source = Split-Path -Parent $MyInvocation.MyCommand.Path
$Target = (Resolve-Path $TargetRepo).Path

if (-not (Test-Path (Join-Path $Target ".git"))) {
  throw "TargetRepo must be your existing Git repository and must contain a .git folder."
}

Write-Host "Mirroring fixed APEX project into:" $Target -ForegroundColor Cyan
Write-Host "Preserving .git, .env.local, node_modules, .next and .vercel" -ForegroundColor DarkGray

$null = robocopy $Source $Target /MIR /R:2 /W:1 /XD ".git" "node_modules" ".next" ".vercel" /XF ".env.local" "tsconfig.tsbuildinfo"
$code = $LASTEXITCODE
if ($code -ge 8) {
  throw "Robocopy failed with exit code $code"
}

$nextCache = Join-Path $Target ".next"
if (Test-Path $nextCache) {
  Remove-Item -Recurse -Force $nextCache
}

Write-Host "" 
Write-Host "Sync complete." -ForegroundColor Green
Write-Host "Now run:" -ForegroundColor Yellow
Write-Host "  cd `"$Target`""
Write-Host "  npm.cmd install"
Write-Host "  npm.cmd run typecheck"
Write-Host "  npm.cmd run build"
Write-Host "  git add -A"
Write-Host "  git commit -m `"Implement APEX reference design across public site`""
Write-Host "  git push origin main"
