/**
 * 使用正确的 rich_text_field JSON 格式更新元字段
 * 
 * rich_text_field 格式参考:
 * {
 *   "type": "root",
 *   "children": [
 *     {
 *       "type": "paragraph",
 *       "children": [
 *         { "type": "text", "value": "文本内容" }
 *       ]
 *     }
 *   ]
 * }
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
    productId: '16073711048264599498333055', // FM0301000269
    metafieldVersion: 'v20241201'
};

// 将 Markdown 列表转换为 rich_text_field JSON 格式
function markdownToRichText(markdown) {
    const lines = markdown.trim().split('\n').filter(l => l.trim());
    const children = [];

    for (const line of lines) {
        // 处理列表项
        if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
            let content = line.trim().slice(1).trim();
            // 处理粗体 **text**
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
        // 处理编号列表
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
        // 普通段落
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

// 元字段内容
const metafieldValues = {
    'key_info': `- **Minimum Order Quantity (MOQ):** 100 Pieces
- **Lead Time:** 15-25 Days
- **Sample Time:** 4-10 Days
- **SKU:** FM0301000269
- **Customization:** Colorways, Print Design, Sizing, Private Labeling`,

    'selling_points': `- **Distinctive Paisley Tribal Pattern:** A rich, vintage-inspired print that combines paisley motifs with geometric tribal elements.
- **Premium Sherpa Fleece Construction:** Ultra-soft, high-pile fleece with exceptional warmth.
- **Versatile Half-Zip Design:** Stand collar with front zip provides adjustable warmth.
- **Cropped Contemporary Fit:** On-trend shorter length that pairs perfectly with high-waisted bottoms.`,

    'Craftsmanship_Quality': `Every detail of this jacket reflects our commitment to quality. We use premium 350 g/m² high-pile polyester fleece. The 175cm fabric width ensures efficient cutting. All seams are reinforced for durability.`,

    'OEM': `Transform this design to match your brand's unique vision. We offer:
- Color Customization
- Print Design modifications
- Sizing & Fit adjustments
- Private Labeling
- Functional Modifications`,

    'Our_Process': `1. **Sample Development:** Fast-track sampling for quick approval.
2. **Material Sourcing:** Premium fleece with quality testing.
3. **Production:** Strict quality control at every stage.
4. **Quality Assurance:** Final inspection and secure packaging.`
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

async function main() {
    console.log('═══════════════════════════════════════════');
    console.log('  更新元字段 (rich_text JSON 格式)');
    console.log('═══════════════════════════════════════════\n');
    
    const metafields = await getMetafields();
    const myFieldsMetafields = metafields.filter(mf => mf.namespace === 'my_fields');
    
    console.log(`找到 ${myFieldsMetafields.length} 个 my_fields 元字段\n`);
    
    for (const mf of myFieldsMetafields) {
        const rawValue = metafieldValues[mf.key];
        if (rawValue) {
            // 转换为 rich_text JSON 格式
            const jsonValue = markdownToRichText(rawValue);
            
            console.log(`更新 ${mf.key}...`);
            console.log(`  类型: ${mf.type}`);
            console.log(`  JSON 预览: ${jsonValue.substring(0, 100)}...`);
            
            const result = await updateMetafield(mf.id, jsonValue, mf.type);
            
            if (result.ok) {
                console.log(`  ✅ 成功\n`);
            } else {
                console.log(`  ❌ 失败: ${result.status}`);
                console.log(`  ${result.body.substring(0, 300)}\n`);
            }
            
            await new Promise(r => setTimeout(r, 500));
        }
    }
    
    console.log('═══════════════════════════════════════════');
    console.log('  完成！请在后台刷新验证');
    console.log('═══════════════════════════════════════════');
}

main().catch(console.error);
