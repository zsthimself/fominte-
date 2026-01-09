/**
 * Google Indexing API 批量提交脚本 (智能版)
 * 
 * 功能：
 * 1. 读取 HTML 站点地图中的所有 URL
 * 2. 读取 'indexing-api-log.txt' 检查已提交的历史记录
 * 3. 自动过滤掉已提交的 URL，仅提交未处理的
 * 4. 提交成功后实时写入日志，支持断点续传
 * 
 * 用法：
 * node scripts/pseo-content-generator/submit-indexing-api.js
 */

import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置路径
const KEY_PATH = path.join(__dirname, '..', '..', 'service_account.json');
// ⚠️ 注意：这里指定了只读取 crochet-html-sitemap.html 这个文件
const SITEMAP_PATH = path.join(__dirname, '..', '..', 'data', 'crochet-html-sitemap.html');
const LOG_PATH = path.join(__dirname, '..', '..', 'data', 'indexing-api-log.txt');
const DOMAIN = 'https://fominte.com';

// 每天配额限制 (默认 200)
const DAILY_LIMIT = 200;

async function main() {
    // 1. 检查密钥文件
    if (!fs.existsSync(KEY_PATH)) {
        console.error('❌ 错误: 未找到密钥文件 service_account.json');
        process.exit(1);
    }

    // 2. 读取并解析 URL
    console.log('📦 读取站点地图...');
    if (!fs.existsSync(SITEMAP_PATH)) {
        console.error(`❌ 错误: 未找到站点地图文件 ${SITEMAP_PATH}`);
        return;
    }
    const html = fs.readFileSync(SITEMAP_PATH, 'utf-8');
    const urlRegex = /href="(\/products\/[^"]+)"/g;
    const allUrls = [];
    let match;
    while ((match = urlRegex.exec(html)) !== null) {
        allUrls.push(DOMAIN + match[1]);
    }
    console.log(`   总共发现 ${allUrls.length} 个 URL。`);

    // 3. 读取已提交日志
    const submittedUrls = new Set();
    if (fs.existsSync(LOG_PATH)) {
        const logContent = fs.readFileSync(LOG_PATH, 'utf-8');
        logContent.split('\n').forEach(line => {
            if (line.trim()) submittedUrls.add(line.trim());
        });
        console.log(`   📚 历史记录: 已成功提交 ${submittedUrls.size} 个。`);
    }

    // 4. 过滤待提交 URL
    const pendingUrls = allUrls.filter(url => !submittedUrls.has(url));
    console.log(`   📝 本次待提交: ${pendingUrls.length} 个。`);

    if (pendingUrls.length === 0) {
        console.log('🎉 所有 URL 都已提交完毕！无需操作。');
        return;
    }

    // 5. 初始化 Google Auth
    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_PATH,
        scopes: ['https://www.googleapis.com/auth/indexing'],
    });
    const indexing = google.indexing({ version: 'v3', auth });

    // 6. 批量提交 (取前 DAILY_LIMIT 个)
    const batch = pendingUrls.slice(0, DAILY_LIMIT);
    console.log(`🚀 开始提交本批次 ${batch.length} 个 URL...`);

    let successCount = 0;
    let failCount = 0;

    for (const [index, url] of batch.entries()) {
        try {
            process.stdout.write(`   [${index + 1}/${batch.length}] 提交: ...${url.slice(-30)} `);

            await indexing.urlNotifications.publish({
                requestBody: {
                    url: url,
                    type: 'URL_UPDATED',
                },
            });

            // 成功后立即写入日志
            fs.appendFileSync(LOG_PATH, url + '\n');
            process.stdout.write('✅ 成功\n');
            successCount++;

            // 稍微延迟一下
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
            process.stdout.write('❌ 失败\n');
            console.error(`      原因: ${error.message}`);
            failCount++;

            if (error.code === 429) {
                console.error('   ⚠️ 达到 Google API 每日配额限制，停止提交。请明天再运行。');
                break;
            }
        }
    }

    console.log('\n📊 本次运行总结');
    console.log(`   成功: ${successCount}`);
    console.log(`   失败: ${failCount}`);
    console.log(`   剩余未提交: ${pendingUrls.length - (successCount + failCount)}`);
    console.log(`   (已记录到 ${LOG_PATH})`);
}

main().catch(console.error);
