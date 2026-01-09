/**
 * 完整测试：上传图片到 Shopline 文件库并获取 URL
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
    fileApiVersion: 'v20241201'
};

// 测试外部图片 URL
const TEST_IMAGE_URL = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400';

/**
 * 上传图片到 Shopline 文件库
 */
async function uploadFile(imageUrl, fileName) {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.fileApiVersion}/files/files.json`;

    console.log(`📤 上传图片: ${fileName}`);

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
        console.log(`   ✅ 上传成功！文件 ID: ${data.id}`);
        return { success: true, id: data.id, data };
    } else {
        console.log(`   ❌ 上传失败: ${text.substring(0, 100)}`);
        return { success: false, error: text };
    }
}

/**
 * 获取文件详情（包括 URL）
 */
async function getFile(fileId) {
    // 正确的端点格式: /files/{file_id}.json
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.fileApiVersion}/files/${fileId}.json`;

    console.log(`📂 查询文件: ${fileId}`);

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${CONFIG.accessToken}`
        }
    });

    const text = await response.text();

    if (response.ok) {
        const data = JSON.parse(text);
        console.log(`   ✅ 获取成功！`);
        console.log(`   文件 URL: ${data.url}`);
        console.log(`   可用状态: ${data.available}`);
        return { success: true, url: data.url, data };
    } else {
        console.log(`   ❌ 获取失败 (${response.status}): ${text.substring(0, 100)}`);
        return { success: false, error: text };
    }
}

/**
 * 删除测试文件
 */
async function deleteFile(fileId) {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.fileApiVersion}/files/${fileId}.json`;

    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${CONFIG.accessToken}`
        }
    });

    if (response.ok) {
        console.log(`   🧹 已删除测试文件`);
    }
}

async function main() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('   完整测试: 上传图片到 Shopline 并获取 URL');
    console.log('═══════════════════════════════════════════════════════\n');

    // 步骤 1: 上传图片
    const uploadResult = await uploadFile(TEST_IMAGE_URL, 'test_complete_flow');

    if (!uploadResult.success) {
        console.log('\n❌ 测试失败：上传步骤出错');
        return;
    }

    // 等待文件处理
    console.log('\n⏳ 等待 2 秒让文件处理...');
    await new Promise(r => setTimeout(r, 2000));

    // 步骤 2: 获取文件详情
    const fileResult = await getFile(uploadResult.id);

    if (fileResult.success) {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('   ✅ 完整流程测试成功！');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`\n可用于元字段的 URL: ${fileResult.url}`);

        // 清理测试文件
        console.log('\n🧹 清理测试文件...');
        await deleteFile(uploadResult.id);
    } else {
        console.log('\n❌ 测试失败：获取文件详情出错');
    }
}

main().catch(console.error);
