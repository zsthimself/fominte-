/**
 * 测试 Shopline 文件上传 API
 * 将外部图片 URL 导入到 Shopline 文件库
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
    fileApiVersion: 'v20241201'  // 使用稳定版本
};

// 测试外部图片 URL
const TEST_IMAGE_URL = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400';

async function createFile(imageUrl, fileName) {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.fileApiVersion}/files/files.json`;

    console.log(`📤 上传: ${fileName}`);
    console.log(`   来源: ${imageUrl.substring(0, 50)}...`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${CONFIG.accessToken}`
            },
            body: JSON.stringify({
                content_type: 'IMAGE',
                original_source: imageUrl,
                file_name: fileName,
                alt: fileName,
                duplicate_resolution_mode: 'APPEND_UUID'
            })
        });

        const text = await response.text();

        if (response.ok) {
            const data = JSON.parse(text);
            console.log(`   ✅ 成功！`);
            console.log(`   文件 ID: ${data.id || data.file?.id || 'N/A'}`);
            return { success: true, data };
        } else {
            console.log(`   ❌ 失败 (${response.status})`);
            console.log(`   错误: ${text.substring(0, 200)}`);
            return { success: false, error: text };
        }
    } catch (error) {
        console.log(`   ❌ 请求错误: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function main() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('   测试 Shopline 文件上传 API');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log(`🏪 店铺: ${CONFIG.storeDomain}`);
    console.log(`🔌 API 版本: ${CONFIG.fileApiVersion}\n`);

    // 测试上传
    const result = await createFile(TEST_IMAGE_URL, 'test_upload_image');

    if (result.success) {
        console.log('\n✅ 文件上传 API 可用！');
        console.log('可以在脚本中集成此功能来批量上传图片。');
    } else {
        console.log('\n❌ 文件上传 API 不可用，可能需要不同的版本或权限。');
    }

    console.log('\n═══════════════════════════════════════════════════════');
}

main();
