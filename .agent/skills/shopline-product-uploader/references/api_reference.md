# Shopline API Reference

产品创建和元字段设置的关键 API 端点。

## 产品创建

```
POST /admin/openapi/v20241201/products.json
```

Body 示例：

```json
{
  "product": {
    "title": "产品标题",
    "handle": "seo-friendly-handle-sku",
    "body_html": "<p>产品描述</p>",
    "status": "draft",
    "tags": ["tag1", "tag2"],
    "variants": [
      {
        "sku": "FM0301000266",
        "price": "0.00"
      }
    ]
  }
}
```

## 元字段创建

⚠️ **必须使用此端点**：

```
POST /admin/openapi/v20241201/products/{product_id}/metafields.json
```

Body 示例：

```json
{
  "metafield": {
    "namespace": "my_fields",
    "key": "OEM",
    "value": "{\"type\":\"root\",\"children\":[...]}",
    "type": "rich_text_field"
  }
}
```

### Rich Text JSON 格式

```json
{
  "type": "root",
  "children": [
    {
      "type": "paragraph",
      "children": [{ "type": "text", "value": "文本内容" }]
    },
    {
      "type": "list",
      "listType": "unordered",
      "children": [
        {
          "type": "list-item",
          "children": [{ "type": "text", "value": "列表项" }]
        }
      ]
    }
  ]
}
```

## 产品查询

```
GET /admin/openapi/v20241201/products.json?handle=xxx
```

## 认证

所有请求需要：

```
Authorization: Bearer {access_token}
```
