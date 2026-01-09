---
description: 批量生成 pSEO 着陆页内容（产品×应用场景）
---

# pSEO 内容生成工作流

此工作流用于批量生成 pSEO 着陆页内容，通过 Google 调研获取 SEO 洞察，然后为每个产品×场景组合生成针对性内容。

## 前置条件

1. 已运行 `npm run generate-matrix` 生成产品×场景矩阵
2. 矩阵文件位于 `data/product-scenario-matrix.json`
3. 待处理列表位于 `data/pending-pseo-pages.json`

## 工作流步骤

### 步骤 1：选择要处理的场景

首先浏览待处理列表，选择一个场景类别进行调研：

```
场景类别：
- 礼服与正装类：evening-gown, cocktail-dress, haute-couture
- 婚庆与新娘类：wedding-dress, reception-dress, bridesmaid-dress, bridal-veil, bridal-robe  
- 民族传统服饰：abaya-kaftan, saree-lehenga, kebaya-kurung
- 舞台表演类：ballroom-latin, figure-skating, stage-costume
- 儿童礼服类：flower-girl, pageant-dress, christening-gown
```

### 步骤 2：场景调研

使用 search_web 工具搜索以下关键词：
- `{场景名} fabric wholesale`
- `{场景名} fabric supplier B2B`
- `best fabric for {场景名}`
- `{场景名} fabric FAQ`

抓取竞品页面，提取：
- SEO 标题结构
- 痛点/优势表述方式
- FAQ 内容模式
- 信任背书

### 步骤 3：生成场景模板

基于调研结果，为该场景生成以下模板：

```json
{
  "seoTitle": "Premium Fabric for {场景名} | Wholesale B2B Supplier",
  "painPoints": "✨ 痛点1||🎨 痛点2||⚡ 痛点3||🌍 痛点4",
  "faq": "Q: 问题1? A: 回答1||Q: 问题2? A: 回答2||Q: 问题3? A: 回答3",
  "trustBadge": "认证1||认证2||认证3||认证4"
}
```

### 步骤 4：应用到产品组合

将模板应用到该场景下的所有产品组合，更新 `product-scenario-matrix.json` 中对应条目的：
- seoTitle
- painPoints
- faq
- trustBadge
- status: "completed"
- generatedAt: 当前时间

### 步骤 5：导出 CSV

// turbo
```bash
cd e:\Bottle1\scripts\pseo-content-generator && npm run export-csv
```

### 步骤 6：导入 Shopline

将生成的 `data/pseo-new-products.csv` 导入 Shopline：
1. Shopline 后台 > Products > Import
2. 选择 CSV 文件
3. 映射字段
4. 导入

## 批量处理建议

- 每次处理 1 个场景类别（如"礼服与正装类"的 3 个场景）
- 相同类别的场景可以复用部分调研内容
- 预计每个场景类别耗时 1-2 小时

## 进度跟踪

查看当前进度：
```bash
cd e:\Bottle1\scripts\pseo-content-generator && node -e "const m=require('../data/product-scenario-matrix.json');console.log('Total:',m.length,'Pending:',m.filter(x=>x.status==='pending').length,'Completed:',m.filter(x=>x.status==='completed').length)"
```
