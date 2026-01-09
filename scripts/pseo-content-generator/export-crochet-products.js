/**
 * pSEO 钩针服装新产品 CSV 导出脚本
 * 
 * 功能：
 * - 读取产品×场景矩阵（已填充 pSEO 内容）
 * - 生成符合 Shopline 导入格式的 CSV
 * 
 * 使用：npm run export-crochet-csv
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置路径
const CONFIG = {
    inputMatrixPath: path.join(__dirname, '..', '..', 'data', 'crochet-product-scenario-matrix.json'),
    outputCsvPath: path.join(__dirname, '..', '..', 'data', 'crochet-pseo-new-products.csv')
};

// 场景对应的集合 Handle
const SCENARIO_COLLECTIONS = {
    'boho-resort': 'boho-resort-crochet',
    'festival-fashion': 'festival-crochet',
    'beach-coverup': 'beach-crochet-coverups',
    'cottagecore': 'cottagecore-crochet',
    'y2k-revival': 'y2k-crochet',
    'boutique-stock': 'wholesale-crochet',
    'private-label': 'oem-crochet',
    'summer-collection': 'summer-crochet'
};

/**
 * 读取矩阵数据
 */
function readMatrix() {
    console.log('Reading matrix from:', CONFIG.inputMatrixPath);
    const content = fs.readFileSync(CONFIG.inputMatrixPath, 'utf-8');
    const matrix = JSON.parse(content);
    console.log(`Found ${matrix.length} entries in matrix`);
    return matrix;
}

/**
 * 转义 CSV 字段
 */
function escapeCSV(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

/**
 * 生成标签
 */
function generateTags(item) {
    const baseTags = [
        'crochet clothing wholesale',
        item.scenarioName,
        'hand crochet',
        'artisan knitwear',
        'B2B wholesale'
    ];

    // 添加原产品标签中的英文标签
    const originalTags = item.originalTags
        .filter(t => /^[a-zA-Z\s&]+$/.test(t))
        .slice(0, 5);

    return [...new Set([...baseTags, ...originalTags])].join(',');
}

/**
 * 生成 CSV 记录
 */
function generateCsvRecords(matrix) {
    const records = [];

    // Shopline CSV 表头
    const headers = [
        'Handle',
        'Title*',
        'Subtitle',
        'Product description html',
        'SPU',
        'Vendor',
        'Tags',
        'Collections',
        'Master image',
        'Image Alt Text',
        'SEO title',
        'SEO description',
        'SEO keywords',
        'Published',
        'Status',
        'Standardized Product Type',
        'Custom Product Type',
        'Created time',
        'SKU',
        'Option1 name',
        'Option1 value',
        'Option2 name',
        'Option2 value',
        'Option3 name',
        'Option3 value',
        'Option4 name',
        'Option4 value',
        'Option5 name',
        'Option5 value',
        'Image',
        'SKU price',
        'SKU compare at price',
        'SKU weight',
        'SKU weight unit',
        'SKU Inventory Tracker',
        'SKU Inventory Policy',
        'SKU Inventory Quantity',
        'Cost per item',
        'Barcode (ISBN, UPC, GTIN, etc.)',
        'SKU tax policy',
        'SKU shipping policy',
        'Google Shopping / Google Product Category',
        'Google Shopping / Gender',
        'Google Shopping / Age Group',
        'Google Shopping / MPN',
        'Google Shopping / AdWords Grouping',
        'Google Shopping / AdWords Labels',
        'Google Shopping / Condition',
        'Google Shopping / Custom Product',
        'Google Shopping / Custom Label 0',
        'Google Shopping / Custom Label 1',
        'Google Shopping / Custom Label 2',
        'Google Shopping / Custom Label 3',
        'Google Shopping / Custom Label 4',
        'Path',
        'HS code',
        'Shipping origin',
        'Included / United States',
        // pSEO Metafields
        'custom.application',
        'custom.scene_image',
        'custom.pain_point',
        'custom.trust_badge',
        'custom.faq',
        'custom.seo_title',
        'custom.target_industry',
        'custom.material_spec'
    ];

    records.push(headers.map(h => escapeCSV(h)).join(','));

    for (const item of matrix) {
        if (item.status !== 'ready') continue;

        const collection = SCENARIO_COLLECTIONS[item.scenarioId] || '';
        const tags = generateTags(item);

        // 准备元字段数据
        const painPoints = (item.meta_pain_points || []).join('||');
        const trustBadges = (item.meta_trust_badges || []).join('||');
        const faqs = (item.meta_faqs || []).join('||');
        // 默认材质规格
        const materialSpec = "Material: Cotton/Acrylic Blend||Care: Hand Wash Cold||Technique: Imitation Hand Crochet";

        const row = [
            item.newHandle,                    // Handle
            item.newTitle,                     // Title*
            '',                                // Subtitle
            item.richDescription,              // Product description html
            '',                                // SPU
            'fominte',                         // Vendor
            tags,                              // Tags
            collection,                        // Collections (空字符串 = 孤儿页面)
            item.masterImage,                  // Master image
            item.newTitle,                     // Image Alt Text
            item.seoTitle,                     // SEO title
            item.seoDescription,               // SEO description
            '',                                // SEO keywords
            'Y',                               // Published
            'Y',                               // Status
            '',                                // Standardized Product Type (空 = 孤儿页面)
            'Crochet Clothing Wholesale',      // Custom Product Type
            '',                                // Created time
            `${item.scenarioId}-${item.originalHandle.substring(0, 20)}`, // SKU
            '',                                // Option1 name
            '',                                // Option1 value
            '',                                // Option2 name
            '',                                // Option2 value
            '',                                // Option3 name
            '',                                // Option3 value
            '',                                // Option4 name
            '',                                // Option4 value
            '',                                // Option5 name
            '',                                // Option5 value
            '',                                // Image
            '0.00',                            // SKU price
            '',                                // SKU compare at price
            '300',                             // SKU weight
            'g',                               // SKU weight unit
            'F',                               // SKU Inventory Tracker
            'deny',                            // SKU Inventory Policy
            '0',                               // SKU Inventory Quantity
            '',                                // Cost per item
            '',                                // Barcode
            'T',                               // SKU tax policy
            'T',                               // SKU shipping policy
            '',                                // Google Shopping / Google Product Category
            '',                                // Google Shopping / Gender
            '',                                // Google Shopping / Age Group
            '',                                // Google Shopping / MPN
            '',                                // Google Shopping / AdWords Grouping
            '',                                // Google Shopping / AdWords Labels
            '',                                // Google Shopping / Condition
            '',                                // Google Shopping / Custom Product
            '',                                // Google Shopping / Custom Label 0
            '',                                // Google Shopping / Custom Label 1
            '',                                // Google Shopping / Custom Label 2
            '',                                // Google Shopping / Custom Label 3
            '',                                // Google Shopping / Custom Label 4
            `/products/${item.newHandle}`,     // Path
            '',                                // HS code
            'CN',                              // Shipping origin
            'TRUE',                            // Included / United States
            // pSEO Metafields Values
            item.scenarioName,                 // custom.application
            item.masterImage,                  // custom.scene_image (复用主图)
            painPoints,                        // custom.pain_point
            trustBadges,                       // custom.trust_badge
            faqs,                              // custom.faq
            item.seoTitle,                     // custom.seo_title
            item.scenarioCategory,             // custom.target_industry
            materialSpec                       // custom.material_spec
        ];

        records.push(row.map(v => escapeCSV(v)).join(','));
    }

    return records;
}

/**
 * 主函数
 */
async function main() {
    console.log('='.repeat(60));
    console.log('📦 Crochet Clothing pSEO CSV Export');
    console.log('='.repeat(60));

    // 1. 读取矩阵
    const matrix = readMatrix();

    // 2. 生成 CSV 记录
    console.log('\nGenerating CSV records...');
    const records = generateCsvRecords(matrix);

    // 3. 写入 CSV 文件
    const csvContent = records.join('\n');
    fs.writeFileSync(CONFIG.outputCsvPath, '\ufeff' + csvContent, 'utf-8'); // BOM for Excel

    console.log(`\n✅ CSV exported to: ${CONFIG.outputCsvPath}`);
    console.log(`Total records: ${records.length - 1} (excluding header)`);

    // 4. 打印示例
    console.log('\n' + '='.repeat(60));
    console.log('📝 Sample entries (first 3):');
    console.log('='.repeat(60));

    const readyItems = matrix.filter(m => m.status === 'ready').slice(0, 3);
    for (const item of readyItems) {
        console.log(`\n  Handle: ${item.newHandle}`);
        console.log(`  Title: ${item.newTitle}`);
        console.log(`  Scenario: ${item.scenarioName}`);
    }
}

main().catch(console.error);
