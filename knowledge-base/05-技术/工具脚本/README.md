# 工具脚本

项目 `scripts/` 目录下的工具脚本说明。

---

## 脚本列表

| 脚本目录 | 说明 |
|---------|------|
| `pseo-content-generator/` | pSEO 内容生成工具 |
| `shopline-metafield-importer/` | Shopline Metafield 导入工具 |

---

## pSEO Content Generator

**位置**：`scripts/pseo-content-generator/`

**功能**：
- 生成产品×场景矩阵
- 导出 Shopline 可导入的 CSV

**主要脚本**：
- `generate-matrix.js` - 生成矩阵
- `export-new-products.js` - 导出面料产品
- `export-crochet-products.js` - 导出成衣产品

---

## Shopline Metafield Importer

**位置**：`scripts/shopline-metafield-importer/`

**功能**：
- 批量导入产品 Metafield
- 图片上传

**配置**：
- `.env` - API 配置
