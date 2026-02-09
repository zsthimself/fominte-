# Shopline 主题开发踩坑指南

> 本文档记录了 Fominte 项目在 Shopline 主题开发过程中遇到的常见问题及解决方案。

## 目录

- [Handlebars 模板语法](#handlebars-模板语法)
- [元字段数据处理](#元字段数据处理)
- [CSS 样式问题](#css-样式问题)
- [常见错误排查](#常见错误排查)

---

## Handlebars 模板语法

### 1. 数组长度检查

❌ **错误写法**：

```handlebars
{{#if parts.length >= 2}}
```

✅ **正确写法**：

```handlebars
{{#if (parts | size()) >= 2}}
```

**原因**：Shopline 的 Handlebars 不支持 JavaScript 风格的 `.length` 属性，必须使用 `| size()` 过滤器。

---

### 2. 数组索引访问

✅ **正确写法**：

```handlebars
{{parts[0] | trim()}}
{{parts[1] | trim()}}
```

**说明**：数组索引使用方括号语法 `parts[0]`，这在 Shopline 中是支持的。

---

### 3. 字符串分割

✅ **正确写法**：

```handlebars
{{#var tutorials = step_by_step_tutorials.value | split("||") /}}
{{#for tutorial in tutorials}}
  ...
{{/for}}
```

**说明**：使用 `| split("分隔符")` 过滤器将字符串分割为数组。

---

### 4. 不支持的过滤器

以下过滤器在 Shopline 中**不可用**或行为不同：

| 过滤器            | 状态        | 替代方案                 |
| ----------------- | ----------- | ------------------------ |
| `replace()`       | ⚠️ 有限支持 | 使用 JavaScript 处理     |
| `safe()`          | ❌ 不支持   | 无                       |
| `slice(0, 1)`     | ❌ 不支持   | 直接硬编码或使用其他方法 |
| `upcase()`        | ⚠️ 需验证   | -                        |
| `newline_to_br()` | ❌ 不支持   | 使用 JavaScript 处理     |

---

## 元字段数据处理

### 1. 获取元字段

```handlebars
{{#var reading_time = article | get_metafield("custom", "reading_time") /}}
```

**使用元字段值**：

```handlebars
{{reading_time.value}}
```

---

### 2. 字面 `\n` 换行问题

**问题**：元字段中存储的 `\n` 是字面字符串（两个字符：`\` 和 `n`），而不是实际换行符。

**CSS 方案（无效）**：

```css
white-space: pre-line; /* 只处理真正的换行符，不处理字面 \n */
```

**JavaScript 方案（有效）**：

```html
<script>
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".tutorial-steps").forEach(function (el) {
      el.innerHTML = el.innerHTML.replace(/\\n/g, "<br>");
    });
  });
</script>
```

---

### 3. 复杂数据结构编码

由于 Shopline 元字段只支持简单类型（单行文本、多行文本、URL 等），复杂数据需要自定义编码：

**推荐格式**：

```
项目1的字段1??项目1的字段2??项目1的字段3||项目2的字段1??项目2的字段2??项目2的字段3
```

- `||` 分隔不同项目
- `??` 分隔同一项目内的字段
- `???` 用于 FAQ 的问答分隔（避免与普通 `??` 冲突）

---

## CSS 样式问题

### 1. 推荐基础字号

```css
.blog-article {
  font-size: 20px; /* 18px 偏小，20px 更舒适 */
  line-height: 1.8;
}
```

### 2. 圆形头像图片

```css
.blog-author-card__avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden; /* 必须添加，否则图片不会裁剪为圆形 */
}

.blog-author-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

---

## 常见错误排查

### 1. 推送失败但无明确错误信息

**症状**：

```
Exit code: 1
╭─ info ─────────────────────────────────────────╮
```

**排查步骤**：

1. 检查是否使用了不支持的过滤器（如 `replace()`, `safe()`）
2. 检查数组语法（`.length` vs `| size()`）
3. 逐步注释代码定位问题

---

### 2. 模块内容不显示

**排查步骤**：

1. 添加调试输出查看原始数据：
   ```handlebars
   <div style="background: #ffe0e0; padding: 10px;">
     DEBUG:
     {{step_by_step_tutorials.value}}
   </div>
   ```
2. 确认数据格式是否符合预期
3. 检查条件判断语法

---

### 3. 系统组件重复渲染

**问题**：使用 `{{#content "blocks" /}}` 后，系统组件渲染两次。

**解决方案**：

- 普通文章模板只使用 `{{#content "blocks" /}}`
- pSEO 模板在 JSON 配置中将系统组件设为 `"disabled": true`

---

## 模板架构最佳实践

### 1. 双模板策略

| 模板                | 用途         | 特点                         |
| ------------------- | ------------ | ---------------------------- |
| `article.json`      | 普通博客文章 | 使用系统组件                 |
| `article.pseo.json` | pSEO 文章    | 禁用系统组件，使用元字段渲染 |

### 2. 条件渲染

```handlebars
{{#if article_intro}}
  {{!-- pSEO 布局 --}}
{{else}}
  {{!-- 普通文章：只渲染系统组件 --}}
  {{#content "blocks" /}}
{{/if}}
```

---

## 更新日志

| 日期       | 更新内容                         |
| ---------- | -------------------------------- |
| 2026-02-09 | 初始版本：记录 pSEO 模板开发经验 |
