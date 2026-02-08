# Shopline CLI 推送快速参考

**日常开发速查手册**

---

## 🚀 标准推送命令

```powershell
# 推送单个文件（最常用）
npx @shoplineos/cli theme push --theme 68c3da6b308b8b294cf01328 --only "sections/main-article/main-article.html"

# 推送 CSS
npx @shoplineos/cli theme push --theme 68c3da6b308b8b294cf01328 --only "sections/main-article/main-article.css"
```

---

## ✅ 推送前检查清单

- [ ] 文件已保存
- [ ] 语法无错误
- [ ] 路径使用 `/`（不是 `\`）
- [ ] UTF-8 编码

---

## ⚠️ 5 大失败原因速查

### 1️⃣ 语法错误（90%的问题）

```
错误：qa_parts.[0]
正确：qa_parts[0]

一键修复：
(Get-Content "file.html" -Raw -Encoding UTF8) -replace '(\w+)\.\[(\d+)\]', '$1[$2]' | Set-Content "file.html" -Encoding UTF8 -NoNewline
```

### 2️⃣ 路径错误

```
错误：--only "sections\main-article\file.html"
正确：--only "sections/main-article/file.html"
```

### 3️⃣ 编码问题

```powershell
# VS Code 右下角 → 选择编码 → UTF-8
```

### 4️⃣ 未登录

```powershell
npx @shoplineos/cli theme login
```

### 5️⃣ 网络超时

```
按 Ctrl+C 终止 → 重新推送
```

---

## 🔍 调试技巧

**看到错误？**

1. 记录行号
2. 打开文件定位到该行
3. 参考"语法限制"章节修复
4. 重新推送

**推送成功？**

- 强制刷新页面（Ctrl + F5）

---

## 📚 详细文档

完整内容请查看：`docs/shopline-development-guide.md`
