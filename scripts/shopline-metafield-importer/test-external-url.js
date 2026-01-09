/**
 * 测试外部 CDN URL 是否可以用于 file_reference 元字段
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
    metafieldVersion: 'v20241201'
};

// 测试产品 ID（使用之前导入成功的产品）
const TEST_PRODUCT_ID = '16073260951674626217073055'; // beaded-lace-wedding-ml001

// 测试外部 CDN 图片 URL（使用一个公共图片）
const TEST_EXTERNAL_URL = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800';

async function testExternalUrl() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('   测试外部 CDN URL 用于 file_reference 元字段');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log(`📷 测试 URL: ${TEST_EXTERNAL_URL}`);
    console.log(`📦 产品 ID: ${TEST_PRODUCT_ID}`);
    console.log(`🔌 API 版本: ${CONFIG.metafieldVersion}\n`);

    // 测试创建一个临时的测试元字段
    const testKey = 'test_external_image';
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.metafieldVersion}/products/${TEST_PRODUCT_ID}/metafields.json`;

    console.log('➤ 尝试使用外部 URL 创建 file_reference 元字段...\n');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${CONFIG.accessToken}`
            },
            body: JSON.stringify({
                metafield: {
                    namespace: 'custom',
                    key: testKey,
                    value: TEST_EXTERNAL_URL,
                    type: 'file_reference'
                }
            })
        });

        const text = await response.text();

        if (response.ok) {
            console.log('✅ 成功！外部 URL 可以用于 file_reference 类型');
            console.log(`\n响应: ${text.substring(0, 200)}`);

            // 删除测试元字段
            console.log('\n🧹 清理测试元字段...');
            try {
                const data = JSON.parse(text);
                if (data.metafield?.id) {
                    const deleteUrl = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.metafieldVersion}/products/${TEST_PRODUCT_ID}/metafields/${data.metafield.id}.json`;
                    await fetch(deleteUrl, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${CONFIG.accessToken}` }
                    });
                    console.log('✓ 测试元字段已删除');
                }
            } catch { }
        } else {
            console.log('❌ 失败！外部 URL 不能直接用于 file_reference 类型');
            console.log(`\n状态码: ${response.status}`);
            console.log(`错误: ${text}`);

            // 尝试使用 url 类型
            console.log('\n\n➤ 尝试使用 url 类型...\n');

            const response2 = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': `Bearer ${CONFIG.accessToken}`
                },
                body: JSON.stringify({
                    metafield: {
                        namespace: 'custom',
                        key: testKey + '_url',
                        value: TEST_EXTERNAL_URL,
                        type: 'url'
                    }
                })
            });

            const text2 = await response2.text();

            if (response2.ok) {
                console.log('✅ 成功！可以使用 url 类型存储外部链接');
                console.log(`\n响应: ${text2.substring(0, 200)}`);

                // 删除测试元字段
                try {
                    const data = JSON.parse(text2);
                    if (data.metafield?.id) {
                        const deleteUrl = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.metafieldVersion}/products/${TEST_PRODUCT_ID}/metafields/${data.metafield.id}.json`;
                        await fetch(deleteUrl, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${CONFIG.accessToken}` }
                        });
                    }
                } catch { }
            } else {
                console.log('❌ url 类型也失败');
                console.log(`错误: ${text2}`);
            }
        }
    } catch (error) {
        console.error('请求出错:', error.message);
    }

    console.log('\n═══════════════════════════════════════════════════════');
}

testExternalUrl();
