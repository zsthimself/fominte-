/**
 * 更新产品描述和元字段（修复后的精简版）
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
    productId: '16073709310739270957393055',
    productVersion: 'v20241201',
    metafieldVersion: 'v20260601'
};

// 精简后的产品描述（只包含开场介绍）
const newDescription = `<h2>Urban Outdoor Style Meets Maximum Comfort</h2>
<p>This hoodie redefines casual cool with its striking abstract camouflage print and exceptionally soft, high-pile sherpa fleece construction. The oversized silhouette and relaxed fit create an effortlessly stylish look, while the plush fabric ensures all-day warmth and comfort. With its unique multi-color palette—blending army green, dusty pink, charcoal, cream, and tan—this hoodie is a versatile statement piece that bridges gorpcore and streetwear aesthetics.</p>`;

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
        type: 'rich_text_field',
        owner_resource: 'products',
        owner_id: CONFIG.productId,
        value: `1. **Sample Development:** Fast-track sampling based on your design request for quick approval.
2. **Material Sourcing:** We source premium fleece fabrics and conduct quality testing to ensure consistency.
3. **Production:** Experienced production teams execute your order with strict quality control at every stage.
4. **Quality Assurance & Shipment:** Final inspection and secure packaging for timely delivery to your warehouse.`
    }
];

// 更新产品描述
async function updateProductDescription() {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.productVersion}/products/${CONFIG.productId}.json`;

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${CONFIG.accessToken}`
        },
        body: JSON.stringify({
            product: {
                body_html: newDescription
            }
        })
    });

    if (response.ok) {
        console.log('✅ 产品描述更新成功');
        return true;
    } else {
        const text = await response.text();
        console.log('❌ 产品描述更新失败:', text.substring(0, 200));
        return false;
    }
}

// 批量更新元字段
async function batchUpdateMetafields() {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.metafieldVersion}/metafields_set.json`;

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

    if (response.ok) {
        const data = await response.json();
        const successCount = data.metafields?.length || 0;
        console.log(`✅ 元字段更新成功: ${successCount} 个`);
        return true;
    } else {
        const text = await response.text();
        console.log('❌ 元字段更新失败:', text.substring(0, 200));
        return false;
    }
}

async function main() {
    console.log('═══════════════════════════════════════════');
    console.log('  更新产品描述和元字段（修复版）');
    console.log('═══════════════════════════════════════════');
    console.log(`产品 ID: ${CONFIG.productId}\n`);

    // Step 1: 更新产品描述（精简版）
    console.log('📝 Step 1: 更新产品描述...');
    await updateProductDescription();

    // Step 2: 批量更新元字段
    console.log('\n📝 Step 2: 更新元字段...');
    await batchUpdateMetafields();

    console.log('\n═══════════════════════════════════════════');
    console.log('  完成！请在 Shopline 后台验证');
    console.log('═══════════════════════════════════════════');
}

main().catch(console.error);
