/**
 * 更新 FM0301000269 的元字段值
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
    productId: '16073711048264599498333055',
    metafieldVersion: 'v20241201'
};

// 获取现有元字段
async function getMetafields() {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.metafieldVersion}/products/${CONFIG.productId}/metafields.json`;
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${CONFIG.accessToken}`
        }
    });
    
    const data = await response.json();
    return data.metafields || [];
}

// 更新元字段值 (PUT)
async function updateMetafield(metafieldId, value, type) {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.metafieldVersion}/products/${CONFIG.productId}/metafields/${metafieldId}.json`;
    
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${CONFIG.accessToken}`
        },
        body: JSON.stringify({
            metafield: {
                id: metafieldId,
                value: value,
                type: type
            }
        })
    });
    
    return response.ok;
}

// 元字段内容 - FM0301000269
const metafieldValues = {
    'key_info': `- **Minimum Order Quantity (MOQ):** 100 Pieces
- **Lead Time:** 15-25 Days
- **Sample Time:** 4-10 Days
- **SKU:** FM0301000269
- **Customization:** Colorways, Print Design, Sizing, Private Labeling`,

    'selling_points': `- **Distinctive Paisley Tribal Pattern:** A rich, vintage-inspired print that combines paisley motifs with geometric tribal elements for a unique, artisanal aesthetic.
- **Premium Sherpa Fleece Construction:** Ultra-soft, high-pile fleece with exceptional warmth and a luxurious hand feel that customers love.
- **Versatile Half-Zip Design:** Stand collar with front zip provides adjustable warmth and creates a clean, modern silhouette.
- **Cropped Contemporary Fit:** On-trend shorter length that pairs perfectly with high-waisted bottoms and aligns with current fashion preferences.`,

    'Craftsmanship_Quality': `Every detail of this jacket reflects our commitment to quality. We use premium 350 g/m² high-pile polyester fleece that delivers superior warmth without excessive bulk. The 175cm fabric width ensures efficient cutting and minimal waste. Our print engineers have developed this paisley pattern to maintain color consistency and visual impact across production runs. All seams are reinforced for durability, and the half-zip features a smooth, reliable metal zipper with a branded pull. The kangaroo pocket is double-stitched for maximum strength.`,

    'OEM': `Transform this best-selling design to match your brand's unique vision. We offer comprehensive customization options:

- **Color Customization:** Choose from a wide range of base colors and create custom colorways to match your brand palette.
- **Print Design:** Modify the paisley pattern, add your own graphics, or develop entirely custom prints.
- **Sizing & Fit:** Produce to your brand's specifications, from fitted to extra-oversized.
- **Private Labeling:** Complete your product with custom branded neck labels, zipper pulls, and packaging.
- **Functional Modifications:** Adjust collar height, add pockets, or incorporate other functional elements.`,

    'Our_Process': `1. **Sample Development:** Fast-track sampling based on your design request for quick approval.
2. **Material Sourcing:** We source premium fleece fabrics and conduct quality testing to ensure consistency.
3. **Production:** Experienced production teams execute your order with strict quality control at every stage.
4. **Quality Assurance & Shipment:** Final inspection and secure packaging for timely delivery to your warehouse.`
};

async function main() {
    console.log('═══════════════════════════════════════════');
    console.log('  更新 FM0301000269 元字段');
    console.log('═══════════════════════════════════════════\n');
    
    const metafields = await getMetafields();
    const myFieldsMetafields = metafields.filter(mf => mf.namespace === 'my_fields');
    
    console.log(`找到 ${myFieldsMetafields.length} 个 my_fields 元字段\n`);
    
    let successCount = 0;
    
    for (const mf of myFieldsMetafields) {
        const newValue = metafieldValues[mf.key];
        if (newValue) {
            const ok = await updateMetafield(mf.id, newValue, mf.type);
            if (ok) {
                console.log(`✅ ${mf.key} 更新成功`);
                successCount++;
            } else {
                console.log(`❌ ${mf.key} 更新失败`);
            }
            await new Promise(r => setTimeout(r, 300));
        }
    }
    
    console.log(`\n完成！成功: ${successCount}/${myFieldsMetafields.length}`);
}

main().catch(console.error);
