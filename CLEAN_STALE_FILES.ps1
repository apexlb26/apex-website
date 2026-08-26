# Use this ONLY if you manually copied this ZIP over an older APEX project.
# It removes old folders that previously caused duplicate routes and Linux/Vercel case errors.
$ErrorActionPreference = "Stop"

$stale = @(
  ".\components",
  ".\shared\components",
  ".\shared\admin",
  ".\shared\content",
  ".\shared\models",
  ".\shared\styles",
  ".\shared\types",
  ".\public\shared",
  ".\app\admin\site",
  ".\app\admin\products",
  ".\app\admin\blogs",
  ".\app\admin\media",
  ".\app\admin\settings",
  ".\app\admin\page.tsx",
  ".\app\icon.svg",
  ".\.next"
)

foreach ($path in $stale) {
  if (Test-Path $path) {
    Remove-Item -Recurse -Force $path
    Write-Host "Removed $path" -ForegroundColor DarkGray
  }
}

Write-Host "Stale files removed. Re-copy the ZIP contents now, then run npm.cmd run build." -ForegroundColor Green
