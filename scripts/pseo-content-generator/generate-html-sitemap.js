/**
 * 生成 HTML 站点地图脚本
 * 
 * 功能：
 * - 读取 pseo-new-products.csv
 * - 按场景/类别分组生成 HTML 链接列表
 * - 输出 html-sitemap.html
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.join(__dirname, '..', '..', 'data', 'crochet-pseo-new-products.csv');
const OUTPUT_PATH = path.join(__dirname, '..', '..', 'data', 'crochet-html-sitemap.html');
const DOMAIN = 'https://fominte.com'; // 替换为实际域名

function main() {
    console.log('📦 读取 CSV 数据...');
    const content = fs.readFileSync(CSV_PATH, 'utf-8');
    const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        bom: true
    });

    console.log(`   找到 ${records.length} 个产品`);
    if (records.length > 0) {
        console.log('   第一条记录的键:', Object.keys(records[0]));
    }

    // 按 Application (Scenario) 分组
    const groups = {};
    for (const record of records) {
        const app = record['custom.application'] || 'Other';
        if (!groups[app]) {
            groups[app] = [];
        }
        groups[app].push(record);
    }

    // 生成 HTML
    let html = `
<div class="pseo-sitemap-container">
    <h1>Wholesale Crochet Clothing Directory</h1>
    <p>Explore our premium crochet clothing collections by application scenario.</p>
    <div class="pseo-sitemap-grid">
`;

    for (const [app, items] of Object.entries(groups)) {
        html += `
        <div class="pseo-sitemap-category">
            <h2>${app}</h2>
            <ul>
`;
        for (const item of items) {
            // 构建 URL: /products/handle
            const url = `/products/${item['Handle']}`;
            html += `                <li><a href="${url}">${item['Title*']}</a></li>\n`;
        }
        html += `
            </ul>
        </div>
`;
    }

    html += `
    </div>
</div>

<style>
.pseo-sitemap-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
}
.pseo-sitemap-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 30px;
}
.pseo-sitemap-category h2 {
    font-size: 1.5rem;
    margin-bottom: 15px;
    border-bottom: 2px solid #eee;
    padding-bottom: 10px;
}
.pseo-sitemap-category ul {
    list-style: none;
    padding: 0;
}
.pseo-sitemap-category li {
    margin-bottom: 8px;
}
.pseo-sitemap-category a {
    text-decoration: none;
    color: #333;
    transition: color 0.2s;
}
.pseo-sitemap-category a:hover {
    color: #007bff;
}
</style>
`;

    fs.writeFileSync(OUTPUT_PATH, html, 'utf-8');
    console.log(`✅ HTML 站点地图已生成: ${OUTPUT_PATH}`);
}

main();
