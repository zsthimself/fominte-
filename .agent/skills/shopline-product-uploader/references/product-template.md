# Product Listing Template

产品描述 Markdown 文件模板。

---

```markdown
# Product Listing: [SKU] [产品名称]

## Module 1: Core Information (Above the Fold)

### 1. Product Title:

- **Primary Title:** [主标题，用于生成 handle]
- **Alternative Title:** [备选标题]
- **Full Title with SKU:** [完整标题] - [SKU]

### 2. Product Images:

- **Main Image:** [SKU].png (Full body front view)
- **Image Gallery Order:**
  1. [SKU].png (Main)
  2. [SKU].1.png (细节图)
  3. [SKU].2.png (其他角度)

### 3. B2B Key Information Box:

- **Minimum Order Quantity (MOQ):** 100 Pieces
- **Lead Time:** 15-25 Days
- **Sample Time:** 4-10 Days
- **SKU:** [SKU]
- **Customization:** Colorways, Print Design, Sizing, Private Labeling

---

## Module 2: Detailed Description

### 1. Product Summary (For the excerpt/summary field):

[1-2 句产品简介，用于摘要/副标题]

---

### 2. Full Description (For the main description body):

## [产品特色标题]

[产品详细描述，2-3 段]

## Selling Points

- **[卖点1标题]:** [描述]
- **[卖点2标题]:** [描述]
- **[卖点3标题]:** [描述]
- **[卖点4标题]:** [描述]

## Craftsmanship & Quality

[工艺和质量说明，1-2 段]

## OEM/ODM Customization

Transform this design to match your brand's unique vision:

- Color Customization: [说明]
- Print Design modifications: [说明]
- Sizing & Fit adjustments: [说明]
- Private Labeling: [说明]

## Our Process

1. **Sample Development:** [描述]
2. **Material Sourcing:** [描述]
3. **Production:** [描述]
4. **Quality Assurance:** [描述]

---

## Recommended Product Tags:

[tag1], [tag2], [tag3], [tag4], [tag5]
```

---

## 字段映射

| Markdown 位置       | CSV 字段                        | Shopline 字段   |
| ------------------- | ------------------------------- | --------------- |
| Primary Title       | Title\*                         | title           |
| SKU                 | SKU                             | variants[0].sku |
| Product Summary     | Subtitle                        | subtitle        |
| Full Description    | Product description html        | body_html       |
| Recommended Tags    | Tags                            | tags            |
| B2B Key Information | my_fields.key_info              | metafield       |
| Selling Points      | my_fields.selling_points        | metafield       |
| Craftsmanship       | my_fields.Craftsmanship_Quality | metafield       |
| OEM/ODM             | my_fields.OEM                   | metafield       |
| Our Process         | my_fields.Our_Process           | metafield       |
