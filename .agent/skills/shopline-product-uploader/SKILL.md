---
name: shopline-product-uploader
description: Shopline 产品批量上传工具。用于从产品描述 Markdown 文件生成 CSV 并自动创建 Shopline 产品（含元字段）。使用场景：(1) 批量创建新产品；(2) 从 Markdown 生成产品 listing；(3) 设置产品元字段（key_info, selling_points, Craftsmanship_Quality, OEM, Our_Process）；(4) 生成 SEO 优化的 product handle。
---

# Shopline Product Uploader

从产品描述 Markdown 文件批量创建 Shopline 产品，包括 SEO 优化 handle 和 rich_text 元字段。

## 工作流程

```mermaid
graph LR
    A[产品 Markdown] --> B[generate_product_csv.py]
    B --> C[产品 CSV]
    C --> D[create-products.js]
    D --> E[Shopline 产品]
```

## 快速开始

### 1. 准备产品描述文件

创建符合模板格式的产品描述 Markdown 文件。参见 [references/product-template.md](references/product-template.md)。

### 2. 生成 CSV

```bash
python scripts/generate_product_csv.py <产品.md> <输出.csv>
```

### 3. 创建产品

```bash
# 修改 scripts/create-products.js 中的 csvPath
node scripts/create-products.js
```

## 核心脚本

| 脚本                              | 功能                          |
| --------------------------------- | ----------------------------- |
| `scripts/generate_product_csv.py` | 从 Markdown 生成 Shopline CSV |
| `scripts/create-products.js`      | 创建产品并设置元字段          |

## 元字段说明

所有 `my_fields` 命名空间的元字段使用 `rich_text_field` 类型，需要特定 JSON 格式：

```json
{
  "type": "root",
  "children": [
    { "type": "paragraph", "children": [{ "type": "text", "value": "内容" }] }
  ]
}
```

脚本内置 `markdownToRichText()` 函数自动转换。

## 关键 API

创建元字段必须使用：

```
POST /admin/openapi/v20241201/products/{product_id}/metafields.json
```

⚠️ `metafields_set.json` 端点虽返回成功但不会实际创建元字段。

## 环境配置

在 `scripts/` 目录创建 `.env` 文件：

```
SHOPLINE_STORE_DOMAIN=your-store.myshopline.com
SHOPLINE_ACCESS_TOKEN=your_access_token
```

## 产品描述模板结构

必须包含以下章节：

- `### 1. Product Title:` - 含 `**Primary Title:**`
- `### 3. B2B Key Information Box:` - MOQ、Lead Time 等
- `## Selling Points` - 列表格式
- `## Craftsmanship & Quality`
- `## OEM/ODM Customization`
- `## Our Process` - 编号列表
- `## Recommended Product Tags:`
