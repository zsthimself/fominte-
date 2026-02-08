# Blog Metafields 数据填充指南

您的模板已经成功加载了！现在需要在文章编辑页面填充 Metafields 数据。

---

## 📍 操作步骤

### 1. 进入文章编辑页面

```
Shopline 后台 → Blogs → 选择您的测试文章
```

### 2. 滚动到页面底部

找到 **"自定义数据"** 或 **"Custom Data"** 区域（通常在页面最底部）

### 3. 填充测试数据

以下是每个字段的测试数据，直接复制粘贴即可：

---

## 📝 快速测试数据模板

### 基础字段（必填）

#### `article_type`

```
how-to
```

#### `reading_time`

```
8 min read
```

#### `difficulty_level`

```
Beginner
```

#### `target_keywords`

```
wedding dress lace||bridal lace fabric||wholesale lace supplier
```

---

### 内容字段

#### `article_intro`

```
Choosing the right lace for your wedding dress is crucial for achieving the perfect look. This comprehensive guide will walk you through everything you need to know about sourcing lace fabric from wholesale suppliers.
```

#### `article_tldr`

```
Wedding dress lace comes in various types (Chantilly, Guipure, Alençon). Key factors include structure, price ($8-25/yard), and MOQ (500-1000 yards). Request samples from 3+ suppliers before ordering. Budget 3-4 months for custom orders.
```

#### `article_conclusion`

```
Sourcing the perfect lace for wedding dresses requires balancing quality, budget, and timeline. By following this guide and working with reputable suppliers, you can ensure your gowns feature beautiful, high-quality lace that your customers will love.
```

---

### How-to 步骤

#### `how_to_steps`

```
Identify Your Design Style??Determine whether your gown is traditional (Alençon lace), modern (geometric Guipure), bohemian (soft Chantilly), or vintage (scalloped edges). This guides your lace selection.||Select Base Fabric Type??Choose between rigid lace (Guipure, Venise) for structured bodices or soft lace (Chantilly, tulle-based) for flowing skirts and overlays.||Request Sample Swatches??Order A4-sized samples from at least 3 suppliers. Test for color match (ivory vs. white), stretch, and opacity under different lighting.||Evaluate Quality Indicators??Check thread density, pattern symmetry, and edge finishing. High-quality lace has consistent motifs and clean scalloped edges without loose threads.||Calculate Yardage Requirements??A full ball gown needs 8-12 yards for overlay, while a mermaid dress requires 4-6 yards. Always order 15% extra for pattern matching and alterations.||Negotiate MOQ and Pricing??Standard MOQ is 500-1000 yards. Request volume discounts and ask about custom dyeing options if you need specific colors.||Place Sample Order First??Before bulk ordering, create one complete dress using your chosen lace. This validates your choice and ensures no surprises during production.
```

---

### 材料和工具（可选）

#### `materials_needed`

```
Lace fabric samples (minimum 3)||Measuring tape||Color swatch card (ivory/white variations)||Lighting booth or natural light area||Magnifying glass for detail inspection
```

#### `tools_required`

```
Fabric scissors||Pins and needles||Dress form or mannequin||Camera for documentation||Vendor comparison spreadsheet
```

---

### 决策框架

#### `use_when`

```
You're designing bridal or evening gowns||You need premium materials for high-end clients||You have a budget of $15+ per yard for fabric||Your production timeline allows 3-4 months||You can meet supplier MOQ of 500+ yards
```

#### `avoid_when`

```
Your budget is under $10 per yard (consider alternatives)||You need fabric within 2 weeks (too short for custom orders)||You're making one-off samples (MOQ won't work)||You lack experience evaluating lace quality||Your design doesn't require structured lace patterns
```

---

### FAQ

#### `faq_items`

```
What's the difference between Chantilly and Guipure lace???Chantilly is soft, delicate, and tulle-based with floral patterns—ideal for romantic, flowing dresses. Guipure (also called Venice lace) is thicker, rigid, and has no mesh background, making it perfect for structured bodices and statement sleeves.||What is a typical MOQ for bridal lace???Most wholesale suppliers require 500-1000 yards per design/color. Some premium suppliers may accept 300 yards for custom colors, but expect a 20-30% price premium. If you need smaller quantities, consider stock laces instead of custom designs.||How long does it take to receive custom lace orders???Standard timeline: 15-20 days for sampling, 30-45 days for bulk production, plus 10-15 days for international shipping. Factor in an extra 2 weeks for potential customs clearance. Always order 3-4 months before your production deadline.||Can I request custom colors or designs???Yes! Most suppliers offer custom dyeing services for orders above MOQ. Custom designs (new jacquard patterns) typically require minimum 2000-5000 yards and involve setup fees of $500-2000. For unique colors, provide Pantone codes for accurate matching.||How do I verify lace quality before ordering???Request physical samples (not just photos). Check: 1) Thread density (higher = better), 2) Pattern symmetry, 3) Edge finishing (clean scallops), 4) Color consistency, 5) Stretch recovery if applicable. Test under different lighting—natural light, indoor, and camera flash.
```

---

### Author Bio（可选）

#### `author_bio`

```
Stephen Chen is the founder of Fominte, a B2B textile manufacturer specializing in premium lace fabrics for bridal and eveningwear. With over 15 years of experience in the industry, he helps designers and boutiques source the perfect materials for their collections.
```

---

## ⚠️ 重要提示

1. **字段命名必须完全匹配**
   - 使用 `reading_time`，不是 `readingTime` 或 `reading-time`
   - 命名空间是 `custom`

2. **分隔符使用**
   - 列表项之间用 `||` 分隔
   - 字段内部（如问答）用 `??` 分隔

3. **保存后刷新**
   - 填充数据后点击"保存"
   - 返回前台页面，强制刷新（Ctrl + F5）

---

## 🎯 最小测试数据集

如果您只想快速测试，至少填充这 5 个字段：

1. `reading_time` → `8 min read`
2. `article_intro` → （任意一段介绍文字）
3. `article_tldr` → （任意一段摘要）
4. `how_to_steps` → （至少一个步骤，格式：`标题??描述`）
5. `faq_items` → （至少一个FAQ，格式：`问题??答案`）

填充这些后，页面就会显示丰富的内容了！

---

## 📸 需要帮助？

如果找不到"自定义数据"区域，请：

1. 截图整个文章编辑页面
2. 或者告诉我页面上有哪些区域

我会帮您定位位置！
