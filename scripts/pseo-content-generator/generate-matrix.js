/**
 * pSEO 产品×场景矩阵生成器
 * 
 * 功能：
 * - 读取 Shopline 产品导出 CSV
 * - 读取应用场景定义 JSON
 * - 根据产品 Tags 自动匹配适用场景
 * - 生成待处理的产品×场景组合列表
 * 
 * 用法：node generate-matrix.js
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// 配置路径
const CONFIG = {
    // Shopline 导出的产品 CSV
    productsCsvPath: path.join(process.cwd(), '..', '..', 'sl-product-export-FOMINTE-30-12-2025-11193897984369370992178_a422a009e5fc4bcb87ea62d66bc6bcfd.csv'),
    // 应用场景定义
    scenariosPath: path.join(process.cwd(), '..', '..', 'data', 'application-scenarios.json'),
    // 输出：产品×场景矩阵
    outputMatrixPath: path.join(process.cwd(), '..', '..', 'data', 'product-scenario-matrix.json'),
    // 输出：待处理列表
    outputPendingPath: path.join(process.cwd(), '..', '..', 'data', 'pending-pseo-pages.json')
};

/**
 * 场景匹配规则
 * 定义产品 Tags 与应用场景的对应关系
 */
const SCENARIO_TAG_MAPPING = {
    // 礼服与正装类
    'evening-gown': ['Evening Gowns', 'Evening Gown Fabric', 'Formal Wear', 'Gala'],
    'cocktail-dress': ['Cocktail', 'Prom', 'Party', 'Prom Dress Fabric'],
    'haute-couture': ['Couture', 'Haute Couture', 'Runway', 'Designer'],

    // 婚庆与新娘类
    'wedding-dress': ['Wedding', 'Bridal', 'Wedding Dress', 'Bridal Gown', 'Bridal Fabric'],
    'reception-dress': ['Reception', 'Toast', 'Red', 'Chinese Wedding'],
    'bridesmaid-dress': ['Bridesmaid'],
    'bridal-veil': ['Veil', 'Bridal Veil'],
    'bridal-robe': ['Robe', 'Morning Robe'],

    // 民族与传统服饰类
    'abaya-kaftan': ['Abaya', 'Kaftan', 'Caftan', 'Middle Eastern', 'Dubai', 'Arabic', 'Kaftans & Abayas'],
    'saree-lehenga': ['Saree', 'Sari', 'Lehenga', 'Indian', 'Choli', 'Saris & Lehengas'],
    'kebaya-kurung': ['Kebaya', 'Baju Kurung', 'Malaysian', 'Indonesian'],

    // 舞台与表演服类
    'ballroom-latin': ['Ballroom', 'Latin', 'Dance', 'Competition Dance'],
    'figure-skating': ['Skating', 'Figure Skating', 'Gymnastics', 'Ice'],
    'stage-costume': ['Stage', 'Costume', 'Theater', 'Opera', 'Musical'],

    // 儿童礼服类
    'flower-girl': ['Flower Girl', 'Tutu'],
    'pageant-dress': ['Pageant', 'Glitz', 'Beauty Pageant'],
    'christening-gown': ['Christening', 'Baptism', 'Christening Gown']
};

/**
 * 从 CSV 读取产品列表（去重，只保留主产品行）
 */
function readProducts(csvPath) {
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n');

    // 跳过前 41 行说明，第 42 行是真正的表头
    const dataLines = lines.slice(41);
    const csvContent = dataLines.join('\n');

    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        bom: true,
        relax_column_count: true
    });

    // 去重：只保留有完整 Title 的主产品行
    const productMap = new Map();
    for (const record of records) {
        const handle = record['Handle']?.trim();
        const title = record['Title*']?.trim();
        const tags = record['Tags']?.trim();

        if (handle && title && !productMap.has(handle)) {
            productMap.set(handle, {
                handle: handle.replace(/\t/g, ''),
                title: title.replace(/\t/g, ''),
                tags: tags?.replace(/\t/g, '') || '',
                sku: record['SKU']?.trim().replace(/\t/g, '') || '',
                subtitle: record['Subtitle']?.trim().replace(/\t/g, '') || '',
                description: record['Product description html']?.trim() || '',
                masterImage: record['Master image']?.trim() || '',
                vendor: record['Vendor']?.trim().replace(/\t/g, '') || 'fominte',
                collections: record['Collections']?.trim().replace(/\t/g, '') || ''
            });
        }
    }

    return Array.from(productMap.values());
}

/**
 * 读取应用场景定义
 */
function readScenarios(jsonPath) {
    const content = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(content);

    // 扁平化场景列表
    const scenarios = [];
    for (const category of data.categories) {
        for (const scenario of category.scenarios) {
            scenarios.push({
                ...scenario,
                categoryId: category.id,
                categoryName: category.name
            });
        }
    }
    return scenarios;
}

/**
 * 匹配产品适用的场景
 */
function matchProductScenarios(product, scenarios) {
    const productTags = product.tags.toLowerCase();
    const productTitle = product.title.toLowerCase();
    const productCollections = product.collections.toLowerCase();

    const matchedScenarios = [];

    for (const scenario of scenarios) {
        const tags = SCENARIO_TAG_MAPPING[scenario.id] || [];

        // 检查是否匹配任何标签
        const isMatch = tags.some(tag => {
            const tagLower = tag.toLowerCase();
            return productTags.includes(tagLower) ||
                productTitle.includes(tagLower) ||
                productCollections.includes(tagLower);
        });

        if (isMatch) {
            matchedScenarios.push(scenario);
        }
    }

    return matchedScenarios;
}

/**
 * 生成新页面的 Handle 和 Title
 */
function generatePageIdentifiers(product, scenario) {
    // 从原 handle 提取产品型号（如 ft25-265）
    const handleMatch = product.handle.match(/^([a-z]+\d+-\d+[a-z]?)/i);
    const productCode = handleMatch ? handleMatch[1].toLowerCase() : product.handle.split('-').slice(0, 2).join('-');

    // 生成新 Handle
    const newHandle = `${productCode}-for-${scenario.id}`;

    // 从原标题提取产品名称（去掉冒号后面的描述）
    const titleMatch = product.title.match(/^([^:]+)/);
    const productName = titleMatch ? titleMatch[1].trim() : productCode.toUpperCase();

    // 生成新 Title
    const newTitle = `${productName}: Premium Fabric ${scenario.title_suffix}`;

    return { newHandle, newTitle };
}

/**
 * 主函数
 */
function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('   pSEO 产品×场景矩阵生成器');
    console.log('═══════════════════════════════════════════════════════════\n');

    // 读取产品
    console.log('📦 读取产品列表...');
    const products = readProducts(CONFIG.productsCsvPath);
    console.log(`   找到 ${products.length} 个产品\n`);

    // 读取场景
    console.log('🎯 读取应用场景...');
    const scenarios = readScenarios(CONFIG.scenariosPath);
    console.log(`   找到 ${scenarios.length} 个场景\n`);

    // 生成矩阵
    console.log('🔄 生成产品×场景矩阵...\n');

    const matrix = [];
    const stats = {
        totalProducts: products.length,
        totalScenarios: scenarios.length,
        totalCombinations: 0,
        scenarioCounts: {}
    };

    for (const product of products) {
        const matchedScenarios = matchProductScenarios(product, scenarios);

        for (const scenario of matchedScenarios) {
            const { newHandle, newTitle } = generatePageIdentifiers(product, scenario);

            matrix.push({
                // 原产品信息
                originalHandle: product.handle,
                originalTitle: product.title,
                originalSku: product.sku,
                originalTags: product.tags,
                masterImage: product.masterImage,

                // 新页面信息
                newHandle,
                newTitle,
                scenarioId: scenario.id,
                scenarioName: scenario.name_en,
                scenarioNameCn: scenario.name_cn,
                categoryId: scenario.categoryId,
                categoryName: scenario.categoryName,

                // pSEO 字段（待填充）
                seoTitle: '',
                targetIndustry: scenario.categoryName,
                painPoints: '',
                faq: '',
                trustBadge: '',

                // 状态
                status: 'pending',
                generatedAt: null
            });

            stats.totalCombinations++;
            stats.scenarioCounts[scenario.id] = (stats.scenarioCounts[scenario.id] || 0) + 1;
        }

        if (matchedScenarios.length > 0) {
            console.log(`   ✓ ${product.handle} → ${matchedScenarios.length} 个场景`);
        }
    }

    // 保存矩阵
    fs.writeFileSync(CONFIG.outputMatrixPath, JSON.stringify(matrix, null, 2), 'utf-8');
    console.log(`\n📄 矩阵已保存: ${CONFIG.outputMatrixPath}`);

    // 保存待处理列表
    const pending = matrix.filter(item => item.status === 'pending');
    fs.writeFileSync(CONFIG.outputPendingPath, JSON.stringify(pending, null, 2), 'utf-8');
    console.log(`📄 待处理列表已保存: ${CONFIG.outputPendingPath}`);

    // 输出统计
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('   统计信息');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`   产品数: ${stats.totalProducts}`);
    console.log(`   场景数: ${stats.totalScenarios}`);
    console.log(`   组合数: ${stats.totalCombinations}`);
    console.log('\n   各场景页面数:');

    // 按数量排序
    const sortedScenarios = Object.entries(stats.scenarioCounts)
        .sort((a, b) => b[1] - a[1]);

    for (const [scenarioId, count] of sortedScenarios) {
        const scenario = scenarios.find(s => s.id === scenarioId);
        console.log(`      ${scenario?.name_en || scenarioId}: ${count}`);
    }

    console.log('\n✅ 矩阵生成完成！');
}

main();
