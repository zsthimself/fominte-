# Shopline CLI 快速配置脚本
# 用途：安装 CLI、登录、推送 pSEO 模板

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Shopline CLI 快速配置" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 步骤 1：检查 Node.js
Write-Host "[步骤 1/5] 检查 Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Node.js 已安装: $nodeVersion" -ForegroundColor Green
}
else {
    Write-Host "❌ 未安装 Node.js！" -ForegroundColor Red
    Write-Host "请先安装 Node.js: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# 步骤 2：安装 Shopline CLI
Write-Host ""
Write-Host "[步骤 2/5] 安装 Shopline CLI..." -ForegroundColor Yellow
Write-Host "执行命令: npm install -g @shopline/cli" -ForegroundColor Cyan

npm install -g @shopline/cli
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Shopline CLI 安装成功" -ForegroundColor Green
}
else {
    Write-Host "❌ 安装失败！" -ForegroundColor Red
    Write-Host "请手动执行: npm install -g @shopline/cli" -ForegroundColor Yellow
    exit 1
}

# 步骤 3：验证安装
Write-Host ""
Write-Host "[步骤 3/5] 验证 CLI 安装..." -ForegroundColor Yellow
Write-Host "✅ 安装完成" -ForegroundColor Green

# 步骤 4：登录提示
Write-Host ""
Write-Host "[步骤 4/5] 登录 Shopline" -ForegroundColor Yellow
Write-Host "即将打开浏览器进行登录..." -ForegroundColor Cyan
Write-Host "请输入您的商店域名（例如：your-store.myshopline.com）：" -ForegroundColor Cyan
$storeDomain = Read-Host "商店域名"

if ($storeDomain) {
    Write-Host "执行命令: sl login --store $storeDomain" -ForegroundColor Cyan
    & npx @shopline/cli login --store $storeDomain
}
else {
    Write-Host "跳过登录，请稍后手动执行: sl login" -ForegroundColor Yellow
}

# 步骤 5：查看主题列表
Write-Host ""
Write-Host "[步骤 5/5] 查看主题列表" -ForegroundColor Yellow
Write-Host "执行命令: sl theme list" -ForegroundColor Cyan

& npx @shopline/cli theme list
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ 请记录您要更新的主题 ID" -ForegroundColor Green
}
else {
    Write-Host "⚠️  无法获取主题列表，请确认已登录" -ForegroundColor Yellow
}

# 最终提示
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "下一步：推送 pSEO 模板" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "执行以下命令推送模板（替换 YOUR_THEME_ID）：" -ForegroundColor Yellow
Write-Host ""
Write-Host "  cd e:\Bottle1" -ForegroundColor White
Write-Host "  npx @shopline/cli theme push --theme YOUR_THEME_ID --only ""sections/main-pseo-landing/*"" --only ""templates/page.pseo-landing.json""" -ForegroundColor White
Write-Host ""
Write-Host "或使用开发模式（实时预览）：" -ForegroundColor Yellow
Write-Host ""
Write-Host "  cd e:\Bottle1" -ForegroundColor White
Write-Host "  npx @shopline/cli theme serve" -ForegroundColor White
Write-Host ""
