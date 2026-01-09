---
name: pseo-generator
description: End-to-end pSEO content generation workflow for Shopline. Use when you need to generate bulk landing pages, manage product matrices, or implement the "Shadow Directory" indexing strategy.
---

# pSEO Generator Skill

## Goal

To generate bulk, high-quality pSEO landing pages for Shopline products. This workflow covers the entire lifecycle: from matrix generation and content creation to importing and ensuring Google indexing via a "Shadow Directory" strategy.

## Prerequisites

1.  **Scripts**: Project must contain `scripts/pseo-content-generator/` and `scripts/shopline-metafield-importer/`.
2.  **Dependencies**: `node >= 16`, `npm`.
3.  **Data**: `data/application-scenarios.json` must exist.
4.  **Frontend Template**: `sections/main-product/main-product.html` **MUST** be configured to render HTML descriptions (use `{{{ product.description }}}`).

## Workflow Steps

### 1. Matrix Generation

Analyze existing products and map them to application scenarios.

- **Command**: `cd scripts/pseo-content-generator && npm run generate-matrix`
- **Output**: `data/product-scenario-matrix.json`
- **Reference**: See [data-structures.md](references/data-structures.md) for matrix format.

### 2. Scenario Research & Content Generation

For each scenario category (e.g., Evening Gown), generate rich content.

1.  **Research**: Search Google for keywords like `"{scenario} fabric wholesale"`.
2.  **Generate**: Update `product-scenario-matrix.json` with pain points, FAQs, trust badges, and rich HTML.

### 3. Export Data (With Auto-Cleaning)

Convert content into Shopline-compatible CSV. **Crucial**: This step applies business logic to clean data.

- **Command**: `cd scripts/pseo-content-generator && npm run export-csv`
- **Output**: `data/pseo-new-products.csv`
- **Reference**: See [data-structures.md](references/data-structures.md) for CSV format and cleaning rules.

### 4. Import to Shopline

> [!IMPORTANT]
> **Shopline 的原生「导入产品」功能无法导入元字段（Metafield）内容。** 必须使用 API 脚本 `shopline-metafield-importer` 来批量创建产品。

Batch create new products in Shopline via API.

- **Command**: `cd scripts/shopline-metafield-importer && npm run create-products`
- **Note**: Use `--test` flag first to import only 3 products for verification.
- **Prerequisite**: Configure `.env` with your Shopline API access token.

### 5. Indexing Strategy (Shadow Directory)

Since pSEO pages are "orphans" (not in menu), use the Shadow Directory strategy to get them indexed.

- **Reference**: See [indexing-strategy.md](references/indexing-strategy.md) for the complete guide on generating sitemaps and submitting to GSC.

## pSEO 模板切换机制

`sections/main-product/main-product.html` 通过检测 `custom.application` 元字段来切换显示模式：

- **有 `custom.application`** → 渲染 B2B Landing Page 布局（Hero Banner + Pain Points + FAQ + 询价表单）
- **无 `custom.application`** → 渲染普通电商产品详情页

### 必需元字段列表

pSEO 页面需要以下元字段才能完整展示：

| 元字段键 | 类型 | 用途 | 是否必需 |
|----------|------|------|----------|
| `custom.application` | single_line_text_field | 应用场景名称（**触发 pSEO 模板**） | ✅ 必需 |
| `custom.seo_title` | single_line_text_field | Hero 区 H1 标题 | 推荐 |
| `custom.scene_image` | single_line_text_field | Hero 背景大图 URL | 推荐 |
| `custom.target_industry` | single_line_text_field | 行业标签 | 可选 |
| `custom.pain_point` | multi_line_text_field | 痛点卖点（`\|\|` 分隔多项） | 推荐 |
| `custom.material_spec` | multi_line_text_field | 材质规格说明 | 可选 |
| `custom.trust_badge` | multi_line_text_field | 信任徽章（`\|\|` 分隔多项） | 推荐 |
| `custom.faq` | multi_line_text_field | FAQ 问答（`\|\|` 分隔多项） | 可选 |

> [!CAUTION]
> **CSV 导出脚本必须包含元字段列！** 如果只导出基础产品字段而不包含 `custom.application` 列，产品将被视为普通产品而非 pSEO Landing Page。

## Troubleshooting

- **pSEO 页面显示为普通产品页**: 确保 CSV 包含 `custom.application` 列，且 `create-products.js` 脚本正确读取并创建该元字段。
- **Description shows HTML tags**: You are likely using `{{ }}` instead of `{{{ }}}` in `main-product.html`.
- **Titles still have SKUs**: Check the regex logic in `export-new-products.js`.
- **Images missing**: Ensure `scene_image` metafield is populated.
- **Pain Points/FAQ 不显示**: 检查元字段值是否使用 `||` 作为分隔符。
