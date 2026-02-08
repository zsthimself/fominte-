# Shopline 主题打包脚本
# 用途：打包主题文件为 ZIP，方便上传到 Shopline

# 配置
$themePath = "e:\Bottle1"
$outputZip = "e:\Bottle1-pseo-theme.zip"

# 删除旧的 ZIP 包（如果存在）
if (Test-Path $outputZip) {
    Remove-Item $outputZip -Force
    Write-Host "已删除旧的 ZIP 包" -ForegroundColor Yellow
}

# 打包主题
Write-Host "开始打包主题..." -ForegroundColor Cyan
Compress-Archive -Path "$themePath\*" -DestinationPath $outputZip -Force

# 检查结果
if (Test-Path $outputZip) {
    $zipSize = (Get-Item $outputZip).Length / 1MB
    Write-Host "✅ 打包成功！" -ForegroundColor Green
    Write-Host "文件位置: $outputZip" -ForegroundColor Green
    Write-Host "文件大小: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Green
    Write-Host ""
    Write-Host "下一步:" -ForegroundColor Cyan
    Write-Host "1. 在 Shopline 后台备份当前主题" -ForegroundColor White
    Write-Host "2. 进入「在线商店」→「主题」" -ForegroundColor White
    Write-Host "3. 点击「上传主题」并选择: $outputZip" -ForegroundColor White
} else {
    Write-Host "❌ 打包失败！" -ForegroundColor Red
}
