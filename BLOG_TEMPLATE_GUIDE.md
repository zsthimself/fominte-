# 博客模板使用指南

## 📄 模板概述

**文件位置**：`sections/main-article/main-article.html`

这是一个生产级别的博客文章模板，完全基于元字段驱动，支持模块化内容展示。所有内容模块都通过元字段控制，实现了灵活的内容组织和自动化内容管理。

---

## 🎨 设计特点

### 1. 元字段驱动

- 所有特殊内容区域都由元字段控制
- 支持条件渲染（有元字段才显示对应模块）
- 使用验证成功的 `get_metafield()` 方法

### 2. 模块化设计

- **文章元信息**：阅读时间、文章类型、作者
- **文章简介**：带样式的高亮简介区域
- **使用场景/避免场景**：双栏对比展示
- **FAQ模块**：问答格式，支持多个FAQ项
- **结论区域**：深色背景的总结部分

### 3. 响应式布局

- 桌面端：双栏场景展示
- 移动端：单栏堆叠布局
- 自适应间距和字体大小

---

## 📋 支持的元字段

### 必需元字段（在后台定义）

| 命名空间 | 键名                 | 类型     | 用途                              |
| -------- | -------------------- | -------- | --------------------------------- | --- | --------------------------------------- |
| `custom` | `reading_time`       | 单行文本 | 阅读时间（如: "8 min read"）      |
| `custom` | `article_type`       | 单行文本 | 文章类型（如: "how-to", "guide"） |
| `custom` | `article_intro`      | 多行文本 | 文章简介                          |
| `custom` | `use_when`           | 多行文本 | 适用场景（用 `                    |     | ` 分隔多项）                            |
| `custom` | `avoid_when`         | 多行文本 | 避免场景（用 `                    |     | ` 分隔多项）                            |
| `custom` | `faq_items`          | 多行文本 | FAQ内容（用 `                     |     | `分隔多个问答，用`???` 分隔问题和答案） |
| `custom` | `comparison_table`   | 多行文本 | 对比表格（预留，未实现）          |
| `custom` | `article_conclusion` | 多行文本 | 文章总结                          |

### 元字段格式示例

#### reading_time

```
8 min read
```

#### article_type

```
how-to
```

#### article_intro

```
Choosing the right lace fabric for wedding dresses is crucial for achieving the perfect balance of structure, elegance, and comfort. This comprehensive guide breaks down everything you need to know about sourcing lace for bridal gowns.
```

#### use_when（使用 || 分隔）

```
Gown bodice needs structure without heavy boning||Creating overlay, sleeves, or train details||Achieving vintage or romantic aesthetic||Client budget is $2000+ for gown
```

#### avoid_when（使用 || 分隔）

```
Budget is under $8/yard||Design is ultra-minimalist satin slip gown||Timeline is under 30 days||Client has lace allergies
```

#### faq_items（使用 || 分隔问答，??? 分隔问题和答案）

```
What is the MOQ for wedding dress lace???Our standard MOQ is 500 yards per design for stock colors, and 2000 yards for custom dyeing.||How long does custom dyeing take???25-30 days from color approval. Rush orders available with 15% surcharge.||Do you provide samples???Yes, free A4 swatches (5-7 days) or $50 for 1-yard strike-offs (10-12 days).
```

#### article_conclusion

```
By following this sourcing guide and understanding your specific requirements, you can confidently select the perfect lace fabric for your wedding dress collection. Remember to balance quality, cost, and timeline considerations.
```

---

## 🎨 模板结构

### 1. 文章头部

```handlebars
{{#if reading_time}}
  <div class="blog-article__meta">
    <!-- 文章类型标签 -->
    <!-- 阅读时间 -->
    <!-- 作者 -->
  </div>
{{/if}}
```

### 2. 文章简介

```handlebars
{{#if article_intro}}
  <div class="blog-article__intro">
    {{article_intro.value}}
  </div>
{{/if}}
```

### 3. 主要内容

```handlebars
<div class="blog-article__content">
  {{#content "blocks" /}}
</div>
```

### 4. 使用/避免场景

```handlebars
{{#if use_when}}
  {{#if avoid_when}}
    <section class="blog-scenarios">
      <!-- 适用场景 -->
      <!-- 避免场景 -->
    </section>
  {{/if}}
{{/if}}
```

### 5. FAQ模块

```handlebars
{{#if faq_items}}
  <section class="blog-faq">
    <!-- 循环显示所有FAQ -->
  </section>
{{/if}}
```

### 6. 结论

```handlebars
{{#if article_conclusion}}
  <section class="blog-conclusion">
    {{article_conclusion.value}}
  </section>
{{/if}}
```

---

## 🚀 使用方法

### 方法1：手动创建文章（适合测试）

1. 进入后台：**在线商店 → 博客 → 博客文章 → 新建文章**
2. 填写标题和主要内容
3. 滚动到底部的"**元字段**"区域
4. 填写各个自定义字段
5. 保存并发布

### 方法2：API批量创建（适合PSEO）

使用我们即将创建的脚本，通过API批量创建文章并填充元字段。

---

## 🎯 设计系统

### 颜色变量

```css
--blog-color-primary: #3d3819; /* 深棕色 */
--blog-color-secondary: #726c4a; /* 中棕色 */
--blog-color-accent: #c9a962; /* 金色 */
--blog-color-background: #ffffff;
--blog-color-light-bg: #f9f9f9;
--blog-color-border: #e5e5e5;
--blog-color-text: #2c2c2c;
--blog-color-text-light: #6b6b6b;
```

### 间距系统

```css
--blog-spacing-xs: 8px;
--blog-spacing-sm: 16px;
--blog-spacing-md: 24px;
--blog-spacing-lg: 40px;
--blog-spacing-xl: 60px;
```

---

## ⚠️ 注意事项

1. **元字段必须先在后台定义**
   - 设置 → 自定义数据 → 博客文章
   - 创建所有需要的元字段定义

2. **分隔符要统一**
   - 多项列表使用：`||`
   - FAQ问答分隔：`???`

3. **条件渲染逻辑**
   - 如果元字段为空，对应模块不会显示
   - 场景模块需要同时有 `use_when` 和 `avoid_when` 才显示

4. **字符串格式**
   - 所有文本都会自动 `trim()` 去除首尾空格
   - 支持换行但建议在单行内完成

---

## 📊 与旧版对比

| 特性       | 旧版（调试版） | 新版（生产版）  |
| ---------- | -------------- | --------------- |
| 调试信息   | ✅ 包含        | ❌ 已移除       |
| 元字段显示 | ✅ 测试成功    | ✅ 正式使用     |
| 样式设计   | ⚠️ 简单        | ✅ 完整设计系统 |
| 模块化     | ❌ 无          | ✅ 完全模块化   |
| 响应式     | ❌ 无          | ✅ 支持移动端   |
| 生产就绪   | ❌ 否          | ✅ 是           |

---

## 🔗 相关文档

- [Shopline开发指南](file:///e:/Bottle1/docs/shopline-developer-guide.md) - 元字段访问最佳实践
- [测试指南](file:///e:/Bottle1/BLOG_METAFIELD_TEST_GUIDE.md) - 元字段测试步骤
- [产品页面示例](file:///e:/Bottle1/sections/main-product/main-product.html) - pSEO成功案例

---

**创建时间**：2026-02-08 15:00  
**状态**：✅ 生产就绪
