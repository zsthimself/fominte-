# pSEO CSV 内容模板使用说明

## 文件概述

`pseo_content_template.csv` 是用于批量创建 pSEO 着陆页的内容模板，适用于 Shopline 产品导入。

---

## CSV 字段说明

| 字段名        | 说明               | 必填 | 格式要求               |
| ------------- | ------------------ | ---- | ---------------------- |
| `Handle`      | URL 友好的产品标识 | ✅   | 小写字母、数字、连字符 |
| `Title`       | 产品标题           | ✅   | 包含关键词             |
| `Body (HTML)` | 产品描述           | ✅   | HTML 格式              |
| `Vendor`      | 供应商/品牌        | ✅   | FOMINTE                |
| `Type`        | 产品类型           | ✅   | 如 Lace Fabric         |
| `Tags`        | 标签               | -    | 逗号分隔               |
| `Published`   | 发布状态           | ✅   | TRUE/FALSE             |

### pSEO 元字段

| 元字段                   | 说明                       | 分隔符 |
| ------------------------ | -------------------------- | ------ | --- | ---------- |
| `custom.application`     | 应用场景（触发 pSEO 模板） | 单值   |
| `custom.seo_title`       | SEO 优化标题               | 单值   |
| `custom.target_industry` | 目标行业                   | 单值   |
| `custom.scene_image`     | Hero 区域背景图 URL        | 单值   |
| `custom.material_spec`   | 材质规格                   | `      |     | ` 分隔多项 |
| `custom.trust_badge`     | 信任徽章                   | `      |     | ` 分隔多项 |
| `custom.pain_point`      | 痛点/优势描述              | `      |     | ` 分隔多项 |
| `custom.faq`             | FAQ 问答                   | `      |     | ` 分隔多条 |

---

## 分隔符使用规范

模板使用 `||` 作为多项内容分隔符：

### Pain Points 示例

```
✨ Hand-sewn beading with <0.1% bead loss||🎨 Custom color matching in 7 days||⚡ Low MOQ 50 yards
```

### Trust Badges 示例

```
Oeko-Tex Standard 100||ISO 9001 Certified||BSCI Audited||30+ Years Export
```

### FAQ 示例

```
Q: What is the MOQ? A: 50 yards for stock, 100 yards for custom.||Q: Lead time? A: 25-40 days.
```

---

## 已包含的示例数据（10 条）

1. **Beaded Lace ML-001** - Wedding Dress 婚纱面料
2. **Sequin Lace SQ-002** - Evening Gown 晚装面料
3. **3D Floral Lace FL-003** - Bridal Gown 新娘礼服
4. **French Lace FC-004** - Couture Gown 高定礼服
5. **African Lace AW-005** - African Wedding 非洲婚礼
6. **Chantilly Lace CV-006** - Bridal Veil 新娘头纱
7. **Stretch Lace SM-007** - Mermaid Wedding Dress 鱼尾婚纱
8. **Pearl Beaded Lace PB-008** - Luxury Bridal 奢华婚纱
9. **Embroidered Tulle ET-009** - Wedding Dress Overlay 婚纱覆层
10. **Heavy Beaded Lace HF-010** - Formal Gala Dress 正式晚宴

---

## 导入步骤

1. 在 Shopline 后台进入 **Products > Import**
2. 选择 `pseo_content_template.csv` 文件
3. 映射字段，确保元字段正确对应
4. 上传场景图片并更新 `scene_image` URL
5. 发布产品

---

## 注意事项

> [!IMPORTANT] > `custom.application` 字段是触发 pSEO 模板的关键，必须填写才能显示 B2B Landing Page 布局。

> [!TIP]
> 使用 Emoji 图标 (✨🎨⚡🌍) 可以让 Pain Points 更加醒目吸引人。

> [!WARNING] > `scene_image` 需要替换为实际的图片 URL，当前为占位符地址。
