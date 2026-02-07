/**
 * 为 FM0301000269 创建元字段 (使用批量 API)
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
    productId: '16073711048264599498333055'
};

// 元字段内容
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
- **SKU:** FM0301000269
- **Customization:** Colorways, Print Design, Sizing, Private Labeling`
    },
    {
        namespace: 'my_fields',
        key: 'selling_points',
        type: 'rich_text_field',
        owner_resource: 'products',
        owner_id: CONFIG.productId,
        value: `- **Distinctive Paisley Tribal Pattern:** A rich, vintage-inspired print that combines paisley motifs with geometric tribal elements for a unique, artisanal aesthetic.
- **Premium Sherpa Fleece Construction:** Ultra-soft, high-pile fleece with exceptional warmth and a luxurious hand feel that customers love.
- **Versatile Half-Zip Design:** Stand collar with front zip provides adjustable warmth and creates a clean, modern silhouette.
- **Cropped Contemporary Fit:** On-trend shorter length that pairs perfectly with high-waisted bottoms and aligns with current fashion preferences.`
    },
    {
        namespace: 'my_fields',
        key: 'Craftsmanship_Quality',
        type: 'rich_text_field',
        owner_resource: 'products',
        owner_id: CONFIG.productId,
        value: `Every detail of this jacket reflects our commitment to quality. We use premium 350 g/m² high-pile polyester fleece that delivers superior warmth without excessive bulk. The 175cm fabric width ensures efficient cutting and minimal waste. Our print engineers have developed this paisley pattern to maintain color consistency and visual impact across production runs. All seams are reinforced for durability, and the half-zip features a smooth, reliable metal zipper with a branded pull. The kangaroo pocket is double-stitched for maximum strength.`
    },
    {
        namespace: 'my_fields',
        key: 'OEM',
        type: 'rich_text_field',
        owner_resource: 'products',
        owner_id: CONFIG.productId,
        value: `Transform this best-selling design to match your brand's unique vision. We offer comprehensive customization options:

- **Color Customization:** Choose from a wide range of base colors and create custom colorways to match your brand palette.
- **Print Design:** Modify the paisley pattern, add your own graphics, or develop entirely custom prints.
- **Sizing & Fit:** Produce to your brand's specifications, from fitted to extra-oversized.
- **Private Labeling:** Complete your product with custom branded neck labels, zipper pulls, and packaging.
- **Functional Modifications:** Adjust collar height, add pockets, or incorporate other functional elements.`
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

async function main() {
    console.log('═══════════════════════════════════════════');
    console.log('  创建 FM0301000269 元字段');
    console.log('═══════════════════════════════════════════\n');
    
    const url = `https://${CONFIG.storeDomain}/admin/openapi/v20260601/metafields_set.json`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${CONFIG.accessToken}`
        },
        body: JSON.stringify({ metafields })
    });
    
    const text = await response.text();
    
    if (response.ok) {
        const data = JSON.parse(text);
        console.log(`✅ 成功创建 ${data.metafields?.length || 0} 个元字段`);
        for (const mf of data.metafields || []) {
            console.log(`   ${mf.key}: ${mf.value ? mf.value.length + '字符' : 'NULL'}`);
        }
    } else {
        console.log('❌ 失败:', response.status);
        console.log(text.substring(0, 500));
    }
}

main().catch(console.error);
