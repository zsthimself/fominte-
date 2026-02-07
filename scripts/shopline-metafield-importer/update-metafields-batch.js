/**
 * 使用批量元字段 API 更新产品元字段
 */

import fs from 'fs';
import path from 'path';

// 加载环境变量
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && !key.startsWith('#')) {
        env[key.trim()] = valueParts.join('=').trim();
    }
});

const CONFIG = {
    storeDomain: env.SHOPLINE_STORE_DOMAIN || 'fominte.myshopline.com',
    accessToken: env.SHOPLINE_ACCESS_TOKEN,
    productId: '16073709310739270957393055'
};

// 元字段数据
const metafields = [
    {
        namespace: 'my_fields',
        key: 'key_info',
        type: 'rich_text_field',
        owner_resource: 'products',
        owner_id: CONFIG.productId,
        value: `- **Minimum Order Quantity (MOQ):** 100 Pieces
- **Lead Time:** 15-25 Days
- **Sample Time:** 4-10 Days
- **SKU:** FM0301000266
- **Customization:** Colorways, Print Design, Sizing, Private Labeling`
    },
    {
        namespace: 'my_fields',
        key: 'selling_points',
        type: 'rich_text_field',
        owner_resource: 'products',
        owner_id: CONFIG.productId,
        value: `- **Eye-Catching Abstract Camo Print:** A unique, artistic interpretation of camouflage in a harmonious multi-color palette that stands out from standard military prints.
- **Premium High-Pile Sherpa Fleece:** Ultra-soft, luxurious fabric with exceptional warmth and a plush texture that customers love.
- **Versatile Oversized Fit:** Relaxed, contemporary silhouette perfect for layering and aligns with current streetwear trends.
- **Functional Hood & Kangaroo Pocket:** Classic hoodie details with drawstring hood and spacious front pocket for everyday practicality.`
    },
    {
        namespace: 'my_fields',
        key: 'Craftsmanship_Quality',
        type: 'rich_text_field',
        owner_resource: 'products',
        owner_id: CONFIG.productId,
        value: "Quality is at the heart of this garment's construction. We use a premium 345 g/m² high-pile polyester fleece that delivers superior warmth without excessive weight. The fabric's 175cm width allows for efficient cutting and minimal waste. The abstract camo print is expertly engineered to create visual interest while maintaining color consistency across production runs. All seams are reinforced with flatlock stitching to prevent fraying and ensure durability through repeated wear and washing. The drawcords feature durable metal-tipped ends, and the kangaroo pocket is double-stitched for strength."
    },
    {
        namespace: 'my_fields',
        key: 'OEM',
        type: 'rich_text_field',
        owner_resource: 'products',
        owner_id: CONFIG.productId,
        value: `Tailor this best-selling hoodie to meet your brand's unique specifications. We offer comprehensive customization options:

- **Color Customization:** Choose from a wide range of base colors and create custom camo colorways to match your brand palette.
- **Print Design:** Modify the camo pattern, add branded graphics, or create entirely custom prints.
- **Sizing & Fit:** Produce this hoodie to your brand's unique sizing specifications, from fitted to extra-oversized.
- **Private Labeling:** Complete your product with custom branded neck labels, hang tags, and packaging.
- **Functional Modifications:** Add zippered pockets, adjust hood design, or incorporate other functional elements.`
    },
    {
        namespace: 'my_fields',
        key: 'Our_Process',
        type: 'multi_line_text_field',
        owner_resource: 'products',
        owner_id: CONFIG.productId,
        value: `1. **Sample Development:** Fast-track sampling based on your design request for quick approval.
2. **Material Sourcing:** We source premium fleece fabrics and conduct quality testing to ensure consistency.
3. **Production:** Experienced production teams execute your order with strict quality control at every stage.
4. **Quality Assurance & Shipment:** Final inspection and secure packaging for timely delivery to your warehouse.`
    }
];

async function batchUpdateMetafields() {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/v20260601/metafields_set.json`;

    console.log('═══════════════════════════════════════════');
    console.log('  使用批量 API 更新元字段');
    console.log('═══════════════════════════════════════════');
    console.log(`产品 ID: ${CONFIG.productId}`);
    console.log(`元字段数: ${metafields.length}\n`);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${CONFIG.accessToken}`
        },
        body: JSON.stringify({
            metafields: metafields
        })
    });

    const text = await response.text();

    if (response.ok) {
        console.log('✅ 批量更新成功!');
        console.log('\n响应:');
        console.log(JSON.stringify(JSON.parse(text), null, 2));
    } else {
        console.log('❌ 批量更新失败');
        console.log(`状态码: ${response.status}`);
        console.log(`错误: ${text}`);
    }
}

batchUpdateMetafields().catch(console.error);
