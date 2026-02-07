/**
 * 更新产品描述 - 修复标题过大问题
 */

import fs from 'fs';
import path from 'path';

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
    productVersion: 'v20241201'
};

// 更简洁的描述 - 使用加粗而非 h2
const descriptions = {
    '16073711048264599498333055': `<p><strong>Urban Heritage Style with Premium Comfort</strong></p>
<p>This standout half-zip jacket brings together vintage paisley patterns and ultra-soft sherpa fleece for a unique statement piece. The cropped silhouette and high stand collar create a contemporary look, while the plush texture delivers exceptional warmth. With its harmonious blend of cream, charcoal, and brown tones, this jacket bridges retro aesthetics with modern streetwear sensibilities—perfect for brands targeting the gorpcore and heritage fashion markets.</p>`,

    '16073709310739270957393055': `<p><strong>Urban Outdoor Style Meets Maximum Comfort</strong></p>
<p>This hoodie redefines casual cool with its striking abstract camouflage print and exceptionally soft, high-pile sherpa fleece construction. The oversized silhouette and relaxed fit create an effortlessly stylish look, while the plush fabric ensures all-day warmth and comfort. With its unique multi-color palette—blending army green, dusty pink, charcoal, cream, and tan—this hoodie is a versatile statement piece that bridges gorpcore and streetwear aesthetics.</p>`
};

async function updateDescription(productId) {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.productVersion}/products/${productId}.json`;
    
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${CONFIG.accessToken}`
        },
        body: JSON.stringify({
            product: {
                body_html: descriptions[productId]
            }
        })
    });
    
    return response.ok;
}

async function main() {
    console.log('更新产品描述（修复标题格式）...\n');
    
    for (const [productId, desc] of Object.entries(descriptions)) {
        console.log(`更新产品 ${productId}...`);
        const ok = await updateDescription(productId);
        console.log(ok ? '  ✅ 成功' : '  ❌ 失败');
        await new Promise(r => setTimeout(r, 500));
    }
    
    console.log('\n完成！');
}

main().catch(console.error);
