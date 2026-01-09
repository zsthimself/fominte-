# Shopline Metafield Importer

## 使用说明

### 运行导入
```bash
cd e:\Bottle1\scripts\shopline-metafield-importer
npm run import
```

### 配置文件
编辑 `.env` 文件设置 API Token：
```
SHOPLINE_STORE_DOMAIN=fominte.myshopline.com
SHOPLINE_ACCESS_TOKEN=your_token_here
```

### CSV 格式
CSV 文件需要放在 `e:\Bottle1\pseo_content_template.csv`

| 列名 | 说明 | 类型 |
|------|------|------|
| Handle | 产品 URL 标识符 | 必填 |
| custom.application | 应用场景 | single_line_text_field |
| custom.seo_title | SEO 标题 | single_line_text_field |
| custom.target_industry | 目标行业 | single_line_text_field |
| custom.scene_image | 场景图片 | file_reference |
| custom.material_spec | 材料规格 | single_line_text_field |
| custom.trust_badge | 信任徽章 | single_line_text_field |
| custom.pain_point | 痛点 | multi_line_text_field |
| custom.faq | FAQ | multi_line_text_field |

### 功能特性
- ✅ 自动检测现有元字段类型
- ✅ 支持创建和更新元字段
- ✅ 自动重试多个 API 版本
- ✅ 详细的日志输出
