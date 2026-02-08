# 博客元字段测试指南

## 🎯 问题发现

通过对比产品页面和博客页面的元字段访问方式，我们发现了关键区别：

### ✅ 产品页面（能正常显示元字段）

```handlebars
{{!-- 使用 get_metafield() 辅助函数 --}}
{{#var pseo_application = product | get_metafield("custom", "application") /}}

{{!-- 访问值 --}}
{{pseo_application.value}}
```

### ❌ 博客页面（之前无法显示）

```handlebars
{{! 直接访问 metafields 对象 }}
{{article.metafields.custom.reading_time.value}}
```

## 💡 解决方案

**在博客页面也使用 `get_metafield()` 函数！**

参考文件：`sections/main-product/main-product.html` (第7-15行)

## 📋 测试步骤

### 第一步：在Shopline后台添加博客元字段

1. 进入：**设置 → 自定义数据 → 博客文章 (Blog posts)**

2. 创建以下元字段定义 (Metafield definitions)：

| 命名空间 | 键名            | 类型                        | 用途     |
| -------- | --------------- | --------------------------- | -------- |
| `custom` | `reading_time`  | 单行文本 (Single line text) | 阅读时间 |
| `custom` | `article_type`  | 单行文本 (Single line text) | 文章类型 |
| `custom` | `article_intro` | 多行文本 (Multi-line text)  | 文章简介 |
| `custom` | `use_when`      | 多行文本 (Multi-line text)  | 使用场景 |
| `custom` | `avoid_when`    | 多行文本 (Multi-line text)  | 避免场景 |
| `custom` | `faq_items`     | 多行文本 (Multi-line text)  | FAQ内容  |

3. **重要**：确保所有字段的命名空间都是 `custom`

### 第二步：给测试文章添加元字段数据

1. 进入：**在线商店 → 博客 → 博客文章**

2. 编辑一篇现有文章（或创建新文章）

3. 在文章编辑页面底部找到"元字段"区域

4. 填写测试数据，例如：
   - `reading_time`: `5 min`
   - `article_type`: `Guide`
   - `article_intro`: `这是一篇测试文章，用于验证元字段功能是否正常工作。`

5. 保存文章

### 第三步：更新前端模板

1. **后台在线编辑** (推荐)
   - 进入：在线商店 → 主题 → 主题操作 → 编辑代码
   - 找到：`sections` → `main-article` → `main-article.html`
   - 复制本地文件 `e:\Bottle1\sections\main-article\main-article.html` 的内容
   - 粘贴并保存

   **或者**

2. **本地文件直接复制**
   - 文件已修改完成：`e:\Bottle1\sections\main-article\main-article.html`
   - 等待找到CLI push的方法后再上传

### 第四步：访问文章查看结果

1. 访问你刚才编辑的博客文章页面

2. 查看页面上的两个测试区域：

#### ✅ 绿色测试区（新方案）

使用 `get_metafield()` 函数访问元字段

**期待结果**：

- 能看到你填写的 `reading_time`、`article_type`、`article_intro` 等值
- 完整元字段对象显示正常的JSON结构
- 条件渲染正常工作

#### 🔍 蓝色调试区（旧方案对比）

直接访问 `article.metafields.custom`

**期待结果**：

- 可能显示 `article.metafields.custom 不存在`
- 或者显示存在但无法访问具体字段的值

## 🎓 关键知识点

### 1. get_metafield() 函数签名

```handlebars
{{#var 变量名 = 对象 | get_metafield("命名空间", "键名") /}}
```

- **对象**：可以是 `product`、`article`、`collection` 等
- **命名空间**：通常是 `custom`
- **键名**：你定义的元字段key

### 2. 访问元字段值的方式

```handlebars
{{!-- 方式1：通过变量访问（推荐） --}}
{{#var reading_time = article | get_metafield("custom", "reading_time") /}}
{{reading_time.value}}

{{!-- 方式2：直接访问（不推荐，可能不工作） --}}
{{article.metafields.custom.reading_time.value}}
```

### 3. 元字段对象结构

```json
{
  "type": "single_line_text_field",
  "value": "5 min",
  "namespace": "custom",
  "key": "reading_time"
}
```

## 🔧 下一步（如果测试成功）

1. 移除调试代码，创建正式的博客模板
2. 设计完整的PSEO博客字段Schema
3. 调整 `fominte-b2b-editor` skill，让AI输出适配元字段的JSON
4. 创建API脚本，批量创建博客文章并填充元字段

## ⚠️ 常见问题

### Q: 为什么产品页面能用但博客页面不能用？

A: 因为 Shopline 的 `article` 对象和 `product` 对象在元字段暴露方式上可能有差异。使用 `get_metafield()` 函数是官方推荐且更可靠的方式。

### Q: 我需要在哪里定义元字段？

A: **设置 → 自定义数据 → 博客文章**，不是在主题设置里。

### Q: 命名空间必须是 custom 吗？

A: 推荐使用 `custom`，这是标准做法，也是产品页面用的命名空间。

## 📝 参考文件

- **产品页面成功案例**：`sections/main-product/main-product.html` (第7-15行)
- **博客页面新实现**：`sections/main-article/main-article.html` (第3-11行)
- **Shopline开发文档**：`docs/shopline-developer-guide.md`

---

**更新时间**：2026-02-08 14:30  
**状态**：等待测试验证
