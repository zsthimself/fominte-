/**
 * 更新产品 Handle（SEO 优化 URL）
 * Handle 格式: {关键词-slug}-{sku}
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取环境变量
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const SHOPLINE_DOMAIN = env.SHOPLINE_STORE_DOMAIN;
const ACCESS_TOKEN = env.SHOPLINE_ACCESS_TOKEN;

// 要更新的产品列表
const PRODUCTS_TO_UPDATE = [
    {
        productId: '1894093174169410614',  // FM0301000266
        sku: 'FM0301000266',
        newHandle: 'vintage-printed-button-down-sherpa-fleece-jacket-fm0301000266'
    },
    {
        productId: '1894399067448411162',  // FM0301000269
        sku: 'FM0301000269', 
        newHandle: 'vintage-paisley-print-half-zip-sherpa-fleece-jacket-fm0301000269'
    }
];

async function updateProductHandle(product) {
    const url = `https://${SHOPLINE_DOMAIN}/admin/openapi/v20241201/products/${product.productId}.json`;
    
    console.log(`\n更新产品 ${product.sku} 的 Handle...`);
    console.log(`新 Handle: ${product.newHandle}`);
    
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ACCESS_TOKEN}`
        },
        body: JSON.stringify({
            product: {
                handle: product.newHandle
            }
        })
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ 更新失败: ${response.status}`);
        console.error(errorText);
        return false;
    }
    
    const data = await response.json();
    console.log(`✅ 更新成功!`);
    console.log(`   新 URL: https://fominte.com/products/${data.product.handle}`);
    return true;
}

async function main() {
    console.log('='.repeat(60));
    console.log('产品 Handle 更新工具（SEO 优化）');
    console.log('='.repeat(60));
    
    let successCount = 0;
    
    for (const product of PRODUCTS_TO_UPDATE) {
        const success = await updateProductHandle(product);
        if (success) successCount++;
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`完成! 成功更新 ${successCount}/${PRODUCTS_TO_UPDATE.length} 个产品`);
    console.log('='.repeat(60));
}

main().catch(console.error);
