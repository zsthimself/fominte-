/**
 * 删除 pSEO 产品脚本
 * 
 * 功能：删除通过 create-products.js 创建的产品
 * 用法：node delete-pseo-products.js
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

// 配置
const CONFIG = {
    storeDomain: env.SHOPLINE_STORE_DOMAIN || 'fominte.myshopline.com',
    accessToken: env.SHOPLINE_ACCESS_TOKEN,
    productVersion: 'v20241201'
};

// 需要删除的产品 handle 列表（从之前的创建结果中获取）
const HANDLES_TO_DELETE = [
    'luxury-wave-for-evening-gown',
    'luxury-wave-for-cocktail-dress',
    'luxury-wave-for-haute-couture',
    'luxury-wave-for-wedding-dress',
    'luxury-wave-for-abaya-kaftan',
    'luxury-wave-for-saree-lehenga',
    'ft25-263-for-evening-gown',
    'ft25-263-for-cocktail-dress',
    'ft25-263-for-haute-couture',
    'luxury-wave-for-reception-dress',
    'luxury-wave-for-bridesmaid-dress'
];

/**
 * 获取产品列表
 */
async function getProducts() {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.productVersion}/products/products.json?limit=250`;
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.accessToken}`
        }
    });

    if (!response.ok) throw new Error(`获取产品失败: ${response.status}`);
    const data = await response.json();
    return data.products || [];
}

/**
 * 删除产品
 */
async function deleteProduct(productId) {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.productVersion}/products/${productId}.json`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.accessToken}`
        }
    });

    return response.ok;
}

/**
 * 主函数
 */
async function main() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('   删除 pSEO 产品');
    console.log('═══════════════════════════════════════════════════════\n');

    if (!CONFIG.accessToken) {
        console.error('❌ 错误: 未配置 SHOPLINE_ACCESS_TOKEN');
        process.exit(1);
    }

    // 获取产品列表
    console.log('📦 获取产品列表...');
    const products = await getProducts();
    console.log(`   共 ${products.length} 个产品\n`);

    // 找到需要删除的产品
    const toDelete = products.filter(p => HANDLES_TO_DELETE.includes(p.handle));
    console.log(`🗑️ 找到 ${toDelete.length} 个需要删除的产品:\n`);

    for (const p of toDelete) {
        console.log(`   - ${p.handle} (ID: ${p.id})`);
    }

    if (toDelete.length === 0) {
        console.log('\n✅ 没有需要删除的产品');
        return;
    }

    console.log('\n───────────────────────────────────────────────────────');
    console.log('开始删除...\n');

    let deleted = 0;
    for (const p of toDelete) {
        process.stdout.write(`   删除 ${p.handle}... `);
        const ok = await deleteProduct(p.id);
        if (ok) {
            console.log('✓');
            deleted++;
        } else {
            console.log('✗');
        }
        await new Promise(r => setTimeout(r, 300));
    }

    console.log(`\n═══════════════════════════════════════════════════════`);
    console.log(`   ✅ 删除完成: ${deleted}/${toDelete.length}`);
    console.log('═══════════════════════════════════════════════════════');
}

main().catch(console.error);
