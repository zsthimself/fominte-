/**
 * 调试元字段 - 获取完整元字段列表并更新
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
    
    const text = await response.text();
    return { ok: response.ok, status: response.status, body: text };
}

// 元字段内容
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

    'OEM': `Tailor this best-selling hoodie to meet your brand's unique specifications. We offer comprehensive customization options:

- **Color Customization:** Choose from a wide range of base colors and create custom camo colorways to match your brand palette.
- **Print Design:** Modify the camo pattern, add branded graphics, or create entirely custom prints.
- **Sizing & Fit:** Produce this hoodie to your brand's unique sizing specifications, from fitted to extra-oversized.
- **Private Labeling:** Complete your product with custom branded neck labels, hang tags, and packaging.
- **Functional Modifications:** Add zippered pockets, adjust hood design, or incorporate other functional elements.`,

    'Our_Process': `1. **Sample Development:** Fast-track sampling based on your design request for quick approval.
2. **Material Sourcing:** We source premium fleece fabrics and conduct quality testing to ensure consistency.
3. **Production:** Experienced production teams execute your order with strict quality control at every stage.
4. **Quality Assurance & Shipment:** Final inspection and secure packaging for timely delivery to your warehouse.`
};

async function main() {
    console.log('═══════════════════════════════════════════');
    console.log('  调试元字段 - 获取并更新');
    console.log('═══════════════════════════════════════════\n');
    
    // Step 1: 获取现有元字段
    console.log('📝 Step 1: 获取现有元字段...');
    const metafields = await getMetafields();
    
    console.log(`找到 ${metafields.length} 个元字段:\n`);
    
    const myFieldsMetafields = metafields.filter(mf => mf.namespace === 'my_fields');
    
    for (const mf of myFieldsMetafields) {
        console.log(`  Key: ${mf.key}`);
        console.log(`    ID: ${mf.id}`);
        console.log(`    Type: ${mf.type}`);
        console.log(`    Value: ${mf.value ? mf.value.substring(0, 50) + '...' : '(空)'}`);
        console.log('');
    }
    
    // Step 2: 更新每个元字段
    console.log('\n📝 Step 2: 更新元字段值...');
    
    for (const mf of myFieldsMetafields) {
        const newValue = metafieldValues[mf.key];
        if (newValue) {
            console.log(`\n  更新 ${mf.key} (ID: ${mf.id})...`);
            const result = await updateMetafield(mf.id, newValue, mf.type);
            
            if (result.ok) {
                console.log(`    ✅ 成功`);
            } else {
                console.log(`    ❌ 失败: ${result.status}`);
                console.log(`    ${result.body.substring(0, 200)}`);
            }
            
            await new Promise(r => setTimeout(r, 300));
        } else {
            console.log(`  ⚠️ 跳过 ${mf.key}: 没有对应的内容`);
        }
    }
    
    console.log('\n═══════════════════════════════════════════');
    console.log('  完成！');
    console.log('═══════════════════════════════════════════');
}

main().catch(console.error);
