/**
 * 使用正确的 API 端点批量更新缺失的 OEM 和 Our_Process 元字段
 * 使用 /products/{id}/metafields.json POST 端点
 */

import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && !key.startsWith('#')) env[key.trim()] = valueParts.join('=').trim();
});

const CONFIG = {
    storeDomain: env.SHOPLINE_STORE_DOMAIN,
    accessToken: env.SHOPLINE_ACCESS_TOKEN
};

// 产品列表
const PRODUCTS = [
    { sku: 'FM0301000268', id: '16073723151311815396603055' },
    { sku: 'FM0301000270', id: '16073723274392324506293055' },
    { sku: 'FM0301000271', id: '16073723279569772954903055' },
    { sku: 'FM0301000274', id: '16073723284235181596623055' },
    { sku: 'FM0301000275', id: '16073723289925509539723055' },
];

// OEM 内容 (rich_text JSON)
const OEM_VALUE = JSON.stringify({
    type: 'root',
    children: [
        { type: 'paragraph', children: [{ type: 'text', value: 'Transform this design to match your brands unique vision:' }] },
        { type: 'list', listType: 'unordered', children: [{ type: 'list-item', children: [{ type: 'text', value: 'Color Customization: Different colorways for the pattern' }] }] },
        { type: 'list', listType: 'unordered', children: [{ type: 'list-item', children: [{ type: 'text', value: 'Print Design modifications: Your own patterns and graphics' }] }] },
        { type: 'list', listType: 'unordered', children: [{ type: 'list-item', children: [{ type: 'text', value: 'Sizing and Fit adjustments: Custom size charts' }] }] },
        { type: 'list', listType: 'unordered', children: [{ type: 'list-item', children: [{ type: 'text', value: 'Private Labeling: Your brands tags and labels' }] }] }
    ]
});

// Our Process 内容 (rich_text JSON)
const PROCESS_VALUE = JSON.stringify({
    type: 'root',
    children: [
        { type: 'list', listType: 'ordered', children: [{ type: 'list-item', children: [{ type: 'text', value: 'Sample Development:', bold: true }, { type: 'text', value: ' Fast-track sampling for quick approval.' }] }] },
        { type: 'list', listType: 'ordered', children: [{ type: 'list-item', children: [{ type: 'text', value: 'Material Sourcing:', bold: true }, { type: 'text', value: ' Premium fleece with quality testing.' }] }] },
        { type: 'list', listType: 'ordered', children: [{ type: 'list-item', children: [{ type: 'text', value: 'Production:', bold: true }, { type: 'text', value: ' Strict quality control at every stage.' }] }] },
        { type: 'list', listType: 'ordered', children: [{ type: 'list-item', children: [{ type: 'text', value: 'Quality Assurance:', bold: true }, { type: 'text', value: ' Final inspection and secure packaging.' }] }] }
    ]
});

async function createMetafield(productId, key, value) {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/v20241201/products/${productId}/metafields.json`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.accessToken}`
        },
        body: JSON.stringify({
            metafield: {
                namespace: 'my_fields',
                key: key,
                value: value,
                type: 'rich_text_field'
            }
        })
    });
    
    return response.ok;
}

async function main() {
    console.log('='.repeat(50));
    console.log('补充 OEM 和 Our_Process 元字段');
    console.log('='.repeat(50) + '\n');
    
    for (const product of PRODUCTS) {
        const oemOk = await createMetafield(product.id, 'OEM', OEM_VALUE);
        const processOk = await createMetafield(product.id, 'Our_Process', PROCESS_VALUE);
        
        const status = (oemOk ? '✓' : '✗') + ' OEM, ' + (processOk ? '✓' : '✗') + ' Our_Process';
        console.log(`${product.sku}: ${status}`);
        
        await new Promise(r => setTimeout(r, 500));
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('完成!');
    console.log('='.repeat(50));
}

main().catch(console.error);
