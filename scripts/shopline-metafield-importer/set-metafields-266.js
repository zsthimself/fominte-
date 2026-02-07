/**
 * 使用 metafields_set API 批量设置元字段
 * 适用于新创建的产品
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
    productId: '16073721839108206194633055', // FM0301000266 新创建的产品
    metafieldVersion: 'v20241201'
};

// 将 Markdown 列表转换为 rich_text_field JSON 格式
function markdownToRichText(markdown) {
    const lines = markdown.trim().split('\n').filter(l => l.trim());
    const children = [];

    for (const line of lines) {
        if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
            let content = line.trim().slice(1).trim();
            const parts = [];
            const boldRegex = /\*\*(.+?)\*\*/g;
            let lastIndex = 0;
            let match;
            
            while ((match = boldRegex.exec(content)) !== null) {
                if (match.index > lastIndex) {
                    parts.push({ type: 'text', value: content.slice(lastIndex, match.index) });
                }
                parts.push({ type: 'text', value: match[1], bold: true });
                lastIndex = match.index + match[0].length;
            }
            if (lastIndex < content.length) {
                parts.push({ type: 'text', value: content.slice(lastIndex) });
            }
            
            children.push({
                type: 'list',
                listType: 'unordered',
                children: [{
                    type: 'list-item',
                    children: parts.length > 0 ? parts : [{ type: 'text', value: content }]
                }]
            });
        } 
        else if (/^\d+\./.test(line.trim())) {
            let content = line.trim().replace(/^\d+\.\s*/, '');
            const parts = [];
            const boldRegex = /\*\*(.+?)\*\*/g;
            let lastIndex = 0;
            let match;
            
            while ((match = boldRegex.exec(content)) !== null) {
                if (match.index > lastIndex) {
                    parts.push({ type: 'text', value: content.slice(lastIndex, match.index) });
                }
                parts.push({ type: 'text', value: match[1], bold: true });
                lastIndex = match.index + match[0].length;
            }
            if (lastIndex < content.length) {
                parts.push({ type: 'text', value: content.slice(lastIndex) });
            }
            
            children.push({
                type: 'list',
                listType: 'ordered',
                children: [{
                    type: 'list-item',
                    children: parts.length > 0 ? parts : [{ type: 'text', value: content }]
                }]
            });
        }
        else {
            children.push({
                type: 'paragraph',
                children: [{ type: 'text', value: line }]
            });
        }
    }

    return JSON.stringify({
        type: 'root',
        children: children
    });
}

// FM0301000266 的元字段内容
const metafieldValues = {
    'key_info': `- **Minimum Order Quantity (MOQ):** 100 Pieces
- **Lead Time:** 15-25 Days
- **Sample Time:** 4-10 Days
- **SKU:** FM0301000266
- **Customization:** Colorways, Print Design, Sizing, Private Labeling`,

    'selling_points': `- **Eye-Catching Abstract Camo Print:** A unique, artistic interpretation of camouflage in a harmonious multi-color palette that stands out from standard military prints.
- **Premium High-Pile Sherpa Fleece:** Ultra-soft, luxurious fabric with exceptional warmth and a plush texture that customers love.
- **Versatile Oversized Fit:** Relaxed, contemporary silhouette perfect for layering and aligns with current streetwear trends.
- **Functional Hood & Kangaroo Pocket:** Classic hoodie details with drawstring hood and spacious front pocket for everyday practicality.`,

    'Craftsmanship_Quality': `Every detail of this hoodie reflects our commitment to quality. We use premium 345 g/m² high-pile polyester fleece that provides exceptional warmth without excessive weight. The 175cm fabric width ensures efficient cutting. All seams are reinforced for durability and the drawstring hood features metal aglets for a premium finish.`,

    'OEM': `Transform this design to match your brand's unique vision. We offer:
- Color Customization: Different colorways for the camo pattern
- Print Design modifications: Your own abstract or camo patterns
- Sizing & Fit adjustments: Custom size charts and fit preferences
- Private Labeling: Your brand's tags and labels
- Functional Modifications: Pocket placement, zipper additions`,

    'Our_Process': `1. **Sample Development:** Fast-track sampling for quick approval.
2. **Material Sourcing:** Premium fleece with quality testing.
3. **Production:** Strict quality control at every stage.
4. **Quality Assurance:** Final inspection and secure packaging.`
};

// 使用 metafields_set API 批量设置元字段
async function setMetafields() {
    const metafields = [];
    
    for (const [key, rawValue] of Object.entries(metafieldValues)) {
        const jsonValue = markdownToRichText(rawValue);
        metafields.push({
            namespace: 'my_fields',
            key: key,
            value: jsonValue,
            type: 'rich_text_field',
            owner_resource: 'product',
            owner_id: CONFIG.productId
        });
    }
    
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.metafieldVersion}/metafields_set.json`;
    
    console.log('发送请求...');
    console.log(`元字段数量: ${metafields.length}`);
    
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
        console.log('✅ 批量设置成功!');
        const data = JSON.parse(text);
        if (data.metafields) {
            data.metafields.forEach(mf => {
                console.log(`   - ${mf.key}: ID=${mf.id}`);
            });
        }
    } else {
        console.log(`❌ 失败: ${response.status}`);
        console.log(text);
    }
}

async function main() {
    console.log('═══════════════════════════════════════════');
    console.log('  批量设置元字段 (metafields_set API)');
    console.log('═══════════════════════════════════════════\n');
    console.log(`产品 ID: ${CONFIG.productId}`);
    console.log('');
    
    await setMetafields();
    
    console.log('\n═══════════════════════════════════════════');
    console.log('  完成！请在后台刷新验证');
    console.log('═══════════════════════════════════════════');
}

main().catch(console.error);
