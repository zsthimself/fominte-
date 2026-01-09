/**
 * 查询已上传文件的详细信息
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

const FILE_ID = '7326203312507735726';

async function getFile(fileId) {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.fileApiVersion}/files/files/${fileId}.json`;

    console.log(`📂 查询文件: ${fileId}`);

    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${CONFIG.accessToken}`
            }
        });

        const text = await response.text();

        if (response.ok) {
            const data = JSON.parse(text);
            console.log(`   ✅ 成功获取文件信息！`);
            console.log(`\n文件详情:`);
            console.log(JSON.stringify(data, null, 2));
            return { success: true, data };
        } else {
            console.log(`   ❌ 失败 (${response.status})`);
            console.log(`   错误: ${text}`);
            return { success: false, error: text };
        }
    } catch (error) {
        console.log(`   ❌ 请求错误: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function main() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('   查询 Shopline 文件信息');
    console.log('═══════════════════════════════════════════════════════\n');

    await getFile(FILE_ID);

    console.log('\n═══════════════════════════════════════════════════════');
}

main();
