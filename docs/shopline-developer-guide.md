# Shopline 开发指南

## 📚 官方文档资源

在开发 Shopline 应用和主题时，请优先参考官方文档：

### 主要文档入口

**Shopline 开发者平台**  
https://developer.shopline.com/

---

## 🔑 核心文档分类

### 1. Admin REST API

**文档地址**：https://developer.shopline.com/zh-hans-cn/docs/admin-rest-api/

包含所有后台管理 API 的完整文档，分类包括：

- **在线商店 (Online Store)**
  - Products（产品）
  - Collections（集合）
  - **Blog Post（博客文章）** ⭐
  - Pages（页面）
  - Themes（主题）

- **订单管理**
- **客户管理**
- **营销功能**
- **分析报表**

### 2. Blog Post API

**文档地址**：https://developer.shopline.com/zh-hans-cn/docs/admin-rest-api/online-store/blog-post/

#### 关键 API 端点

##### 创建博客文章

```
POST /admin/openapi/{version}/store/blogs/{blog_collection_id}/articles.json
```

**完整请求示例**：

```bash
curl --request POST \
  --url https://{handle}.myshopline.com/admin/openapi/v20251201/store/blogs/{blog_collection_id}/articles.json \
  --header 'Authorization: Bearer {access_token}' \
  --header 'Content-Type: application/json; charset=utf-8' \
  --data '{
    "blog": {
      "title": "文章标题",
      "handle": "article-handle",
      "content_html": "<p>文章正文的HTML内容</p>",
      "digest": "文章摘要",
      "author": "作者名",
      "published": true,
      "published_at": "2024-06-25T11:15:47+08:00",
      "url": "/custom-url",
      "template_name": "templates/blogs/detail.json",
      "image": {
        "src": "https://img.myshopline.com/image.jpg",
        "alt": "图片描述"
      }
    }
  }'
```

**请求参数说明**：

| 参数                 | 类型    | 必填 | 说明                          |
| -------------------- | ------- | ---- | ----------------------------- |
| `blog_collection_id` | string  | ✅   | 博客集合ID（路径参数）        |
| `blog.title`         | string  | ✅   | 文章标题                      |
| `blog.handle`        | string  | ✅   | URL友好的唯一标识符           |
| `blog.content_html`  | string  | ⭕   | HTML格式的文章内容（限制5MB） |
| `blog.digest`        | string  | ⭕   | 文章摘要                      |
| `blog.author`        | string  | ⭕   | 作者名称                      |
| `blog.published`     | boolean | ⭕   | 是否发布（true/false）        |
| `blog.published_at`  | string  | ⭕   | 发布时间（ISO 8601格式）      |
| `blog.url`           | string  | ⭕   | 自定义路由（最大512字符）     |
| `blog.template_name` | string  | ⭕   | 关联的模板名称                |
| `blog.image`         | object  | ⭕   | 封面图片信息                  |
| `blog.image.src`     | string  | ⭕   | 图片URL                       |
| `blog.image.alt`     | string  | ⭕   | 图片alt文本                   |

**响应示例**（成功 200）：

```json
{
  "traceId": "request-trace-id",
  "blog": {
    "id": "66718d010588d64ef7d15c96",
    "title": "文章标题",
    "handle": "article-handle",
    "author": "作者名",
    "content_html": "<p>文章正文的HTML内容</p>",
    "digest": "文章摘要",
    "published_at": "2024-06-25T11:15:47+08:00",
    "created_at": "2024-06-18T13:34:57+00:00",
    "updated_at": "2024-06-19T12:42:55+00:00",
    "blog_collection_id": "64e313c4cd5956279e61d150",
    "image": {
      "src": "https://img.myshopline.com/image.jpg",
      "alt": "图片描述"
    }
  }
}
```

##### 获取文章列表

```
GET /admin/openapi/{version}/store/blogs/{blog_collection_id}/articles.json
```

##### 获取单篇文章

```
GET /admin/openapi/{version}/store/blogs/{blog_collection_id}/articles/{article_id}.json
```

##### 更新文章

```
PUT /admin/openapi/{version}/store/blogs/{blog_collection_id}/articles/{article_id}.json
```

##### 删除文章

```
DELETE /admin/openapi/{version}/store/blogs/{blog_collection_id}/articles/{article_id}.json
```

#### ⚠️ 重要说明

1. **API 路径结构**
   - 基础路径：`/admin/openapi/{version}/store/blogs/`
   - 需要指定 `blog_collection_id`（博客集合 ID）
   - 注意 `store` 这一层级

2. **访问权限**  
   API 访问需要正确的权限范围(Access Scope)：
   - 需要 `write_blogs` 权限才能创建/更新博客
   - 需要 `read_blogs` 权限才能读取博客
   - 参考：https://developer.shopline.com/zh-hans-cn/docs/apps/api-instructions-for-use/access-scope

3. **API 版本**
   - 最新：`v20260601` (Unstable)
   - 稳定：`v20251201`, `v20241201` 等
   - **推荐使用稳定版本** `v20251201`

4. **获取 blog_collection_id**
   - 登录后台：在线商店 → 博客 → 博客管理
   - URL中可以看到集合ID
   - 或通过API获取：`GET /admin/openapi/{version}/store/blogs.json`

---

## 📖 其他重要文档

### Metafields（元字段）

**文档地址**：https://developer.shopline.com/zh-hans-cn/docs/admin-rest-api/metafields/

- 元字段Data类型
- 元字段定义(Metafield Definitions)
- 创建和管理元字段

---

## 🎯 模板层元字段访问最佳实践

> **⚠️ 关键突破**：经过实战测试发现，在 Shopline 的 Handlebars 模板中访问元字段的**唯一可靠方式**是使用 `get_metafield()` 辅助函数，而**不是**直接访问 `object.metafields.namespace.key` 路径。

### ✅ 正确方式：使用 get_metafield() 函数

```handlebars
{{!-- 1. 定义变量，使用 get_metafield() 获取元字段 --}}
{{#var reading_time = article | get_metafield("custom", "reading_time") /}}
{{#var article_type = product | get_metafield("custom", "application") /}}

{{!-- 2. 访问元字段值（使用 .value） --}}
<p>阅读时间：{{reading_time.value}}</p>
<p>应用场景：{{article_type.value}}</p>

{{!-- 3. 条件渲染 --}}
{{#if reading_time}}
  <span>{{reading_time.value}}</span>
{{/if}}
```

### ❌ 错误方式：直接访问 metafields 对象

```handlebars
{{!-- ⚠️ 这种方式在博客文章(article)等资源中不工作 --}}
{{article.metafields.custom.reading_time.value}}  ❌ 无法访问

{{!-- 原因：article.metafields 在模板层没有暴露 --}}
{{article.metafields | json()}}  → 返回 null
```

### 📋 元字段对象结构

使用 `get_metafield()` 函数返回的是一个完整的元字段对象：

```json
{
  "type": "single_line_text_field",
  "value": "8 min read",
  "namespace": "custom",
  "key": "reading_time",
  "object_type": "metafield",
  "raw": "8 min read",
  "list": false
}
```

**访问属性**：

- `.value` - 元字段的值（最常用）
- `.type` - 元字段类型
- `.namespace` - 命名空间
- `.key` - 键名

### 🔧 适用资源

`get_metafield()` 函数适用于所有支持元字段的资源：

```handlebars
{{!-- 产品 --}}
{{#var spec = product | get_metafield("custom", "material_spec") /}}

{{!-- 博客文章 --}}
{{#var intro = article | get_metafield("custom", "article_intro") /}}

{{!-- 集合 --}}
{{#var banner = collection | get_metafield("custom", "banner_image") /}}

{{!-- 页面 --}}
{{#var meta = page | get_metafield("custom", "seo_description") /}}
```

### 💡 实战案例

#### 产品页面 pSEO 元字段

参考：`sections/main-product/main-product.html`

```handlebars
{{!-- 获取所有 pSEO 相关元字段 --}}
{{#var pseo_application = product | get_metafield("custom", "application") /}}
{{#var pseo_pain_point = product | get_metafield("custom", "pain_point") /}}
{{#var pseo_faq = product | get_metafield("custom", "faq") /}}

{{!-- 在模板中使用 --}}
{{#if pseo_application}}
  <span class="application-tag">{{pseo_application.value}}</span>
{{/if}}

{{!-- 分割字符串处理 --}}
{{#if pseo_pain_point}}
  {{#var pain_items = pseo_pain_point.value | split("||") /}}
  {{#for item in pain_items}}
    <p>{{item | trim()}}</p>
  {{/for}}
{{/if}}
```

#### 博客文章元字段

参考：`sections/main-article/main-article.html`

```handlebars
{{!-- 获取博客元字段 --}}
{{#var reading_time = article | get_metafield("custom", "reading_time") /}}
{{#var article_type = article | get_metafield("custom", "article_type") /}}
{{#var faq_items = article | get_metafield("custom", "faq_items") /}}

{{!-- 显示阅读时间 --}}
{{#if reading_time}}
  <span class="reading-time">{{reading_time.value}}</span>
{{/if}}

{{!-- 处理 FAQ --}}
{{#if faq_items}}
  {{#var faqs = faq_items.value | split("||") /}}
  {{#for faq in faqs}}
    <div class="faq-item">{{faq}}</div>
  {{/for}}
{{/if}}
```

### 🚨 重要注意事项

1. **命名空间推荐使用 `custom`**
   - 这是 Shopline 的标准做法
   - 与产品、博客等资源保持一致

2. **必须先定义元字段**
   - 在后台：设置 → 自定义数据 → 选择资源类型
   - 创建元字段定义时指定命名空间和键名

3. **元字段值的数据类型**
   - `single_line_text_field` - 单行文本
   - `multi_line_text_field` - 多行文本
   - 其他类型请参考官方文档

4. **性能考虑**
   - `get_metafield()` 是官方推荐的方式
   - 已经过优化，不会造成性能问题

### 📚 相关文件

- 产品页面示例：[main-product.html](file:///e:/Bottle1/sections/main-product/main-product.html) (第7-15行)
- 博客页面示例：[main-article.html](file:///e:/Bottle1/sections/main-article/main-article.html) (第3-11行)
- 测试指南：[BLOG_METAFIELD_TEST_GUIDE.md](file:///e:/Bottle1/BLOG_METAFIELD_TEST_GUIDE.md)

### 主题开发

**文档地址**：https://developer.shopline.com/zh-hans-cn/docs/themes/

- Liquid 模板语法
- 主题结构
- Section 和 Block
- 主题设置

### 应用开发

**文档地址**：https://developer.shopline.com/zh-hans-cn/docs/apps/

- 应用授权
- Webhook
- App Extensions

---

## 🛠️ API 使用说明

### 1. 获取访问令牌

参考文档：https://developer.shopline.com/zh-hans-cn/docs/apps/api-instructions-for-use/app-authorization

### 2. API 请求格式

```bash
curl --request POST \
  --url https://{handle}.myshopline.com/admin/openapi/{version}/store/blogs/{blog_collection_id}/articles.json \
  --header 'Authorization: Bearer {access_token}' \
  --header 'Content-Type: application/json; charset=utf-8' \
  --data '{
    "blog": {
      "title": "文章标题",
      "content_html": "文章内容",
      "handle": "article-handle",
      "published": true
    }
  }'
```

### 3. HTTP 状态码

参考文档：https://developer.shopline.com/zh-hans-cn/docs/apps/api-instructions-for-use/http-status-code

常见状态码：

- `200`: 成功
- `401`: 未授权
- `404`: 资源不存在
- `429`: 请求过于频繁

---

## 💡 最佳实践

### 1. 查找 API 资料时

1. **优先访问**：https://developer.shopline.com/
2. **搜索关键词**：使用英文关键词搜索（如 "blog", "article", "metafield"）
3. **查看版本**：确认使用的 API 版本
4. **检查权限**：确认 Access Token 有足够的权限

### 2. 调试 API 问题

1. 使用官方提供的示例代码
2. 检查请求头（Authorization, Content-Type）
3. 验证请求体格式（JSON）
4. 查看返回的错误信息

### 3. 版本管理

- 生产环境使用 **Stable** 版本
- 测试功能使用 **Release Candidate** 或 **Unstable** 版本
- 关注版本更新说明

---

## 📝 快速参考

### 常用 API 版本

| 版本      | 状态     | 建议用途     |
| --------- | -------- | ------------ |
| v20260601 | Unstable | 测试最新功能 |
| v20251201 | Stable   | 生产环境推荐 |
| v20241201 | Stable   | 生产环境推荐 |

### 常用文档链接

| 功能         | 文档链接                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------- |
| Blog API     | https://developer.shopline.com/zh-hans-cn/docs/admin-rest-api/online-store/blog-post/          |
| Metafields   | https://developer.shopline.com/zh-hans-cn/docs/admin-rest-api/metafields/                      |
| 应用授权     | https://developer.shopline.com/zh-hans-cn/docs/apps/api-instructions-for-use/app-authorization |
| Access Scope | https://developer.shopline.com/zh-hans-cn/docs/apps/api-instructions-for-use/access-scope      |
| HTTP 状态码  | https://developer.shopline.com/zh-hans-cn/docs/apps/api-instructions-for-use/http-status-code  |

---

## 🔧 本项目使用的 API

### Product API

```
GET /admin/openapi/{version}/products/products.json
POST /admin/openapi/{version}/products/products.json
PUT /admin/openapi/{version}/products/{product_id}.json
```

### Metafields API (Product)

```
GET /admin/openapi/{version}/products/{product_id}/metafields.json
POST /admin/openapi/{version}/products/{product_id}/metafields.json
```

### Blog API (新增)

```
POST /admin/openapi/{version}/store/blogs/{blog_collection_id}/articles.json
GET /admin/openapi/{version}/store/blogs/{blog_collection_id}/articles.json
```

### Files API

```
POST /admin/openapi/{version}/files/files.json
GET /admin/openapi/{version}/files/{file_id}.json
```

---

## ⚠️ 注意事项

1. **API 端点结构**
   - Product API: `/admin/openapi/{version}/products/...`
   - Blog API: `/admin/openapi/{version}/store/blogs/...` ⚠️ 注意 `store` 前缀

2. **认证要求**
   - 所有 API 请求都需要 Bearer Token
   - Token 在 `.env` 文件中配置为 `SHOPLINE_ACCESS_TOKEN`

3. **请求频率限制**
   - 注意 API 调用频率
   - 遇到 429 错误时添加延迟

4. **数据格式**
   - Content-Type 必须是 `application/json; charset=utf-8`
   - 日期格式使用 ISO 8601

---

## 📞 获取帮助

- **官方文档**：https://developer.shopline.com/
- **开发者社区**：查看官网的社区/论坛链接
- **技术支持**：通过 Shopline 后台提交支持工单

---

## 🎯 关键发现与突破总结

### 2026-02-08：博客元字段访问突破

**问题**：博客文章的元字段无法在Handlebars模板中显示

**根本原因**：

- `article.metafields` 对象在Shopline的Handlebars模板层**没有暴露**
- 直接访问 `{{article.metafields.custom.xxx.value}}` 返回 `null`

**解决方案**：

- 使用 `get_metafield()` 辅助函数：`{{#var field = article | get_metafield("custom", "key") /}}`
- 这是产品页面元字段能正常工作的关键方法
- 参考：`sections/main-product/main-product.html` (第7-15行)

**验证结果**：✅ 已在生产环境验证成功

- 所有博客元字段（`reading_time`, `article_type`, `article_intro`, `faq_items` 等）均能正常访问
- 元字段对象结构完整，包含 `type`, `value`, `namespace`, `key` 等属性
- 条件渲染和字符串分割处理正常工作

**影响范围**：

- 为批量PSEO博客系统扫清了技术障碍
- 确认了元字段在模板层的唯一可靠访问方式
- 适用于所有资源类型（product, article, collection, page等）

**相关文档**：

- [模板层元字段访问最佳实践](#🎯-模板层元字段访问最佳实践)
- [测试指南](file:///e:/Bottle1/BLOG_METAFIELD_TEST_GUIDE.md)

---

**更新日期**：2026-02-08 14:45  
**维护者**：项目开发团队  
**最后重大更新**：博客元字段访问方法突破（get_metafield函数）
