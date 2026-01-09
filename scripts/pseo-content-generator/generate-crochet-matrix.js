/**
 * pSEO 钩针服装产品×场景矩阵生成器 v2
 * 
 * 策略：每个产品覆盖所有8个场景，生成最大化的pSEO页面
 * 集成：使用 data/crochet-scenario-research.json 中的调研数据
 * 
 * 使用：npm run generate-crochet-matrix
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置路径
const CONFIG = {
    inputCsvPath: path.join(__dirname, '..', '..', 'sl-product-export-FOMINTE-31-12-2025-crochet-clothing.csv'),
    scenariosPath: path.join(__dirname, '..', '..', 'data', 'crochet-application-scenarios.json'),
    researchPath: path.join(__dirname, '..', '..', 'data', 'crochet-scenario-research.json'),
    outputMatrixPath: path.join(__dirname, '..', '..', 'data', 'crochet-product-scenario-matrix.json'),
    outputPendingPath: path.join(__dirname, '..', '..', 'data', 'crochet-pending-pseo-pages.json')
};

/**
 * 解析 CSV 行（处理带引号字段和多行内容）
 */
function parseCSVLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            fields.push(current.trim().replace(/\t/g, ''));
            current = '';
        } else {
            current += char;
        }
    }
    fields.push(current.trim().replace(/\t/g, ''));

    return fields;
}

/**
 * 从 CSV 读取产品列表
 */
function readProducts(csvPath) {
    console.log('Reading products from:', csvPath);
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\r\n');

    console.log(`Total lines in file: ${lines.length}`);

    // 找到数据行的实际开始位置（跳过说明行和表头）
    let dataStartIndex = 42; // 默认：42行说明 + 1行表头

    const products = [];
    const seenHandles = new Set();

    for (let i = dataStartIndex; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const fields = parseCSVLine(line);

        // 列索引（基于 Shopline 导出格式）
        // 0: spuid, 1: skuid, 2: Handle, 3: Title, 4: Subtitle, 5: Description, 
        // 6: SPU, 7: Vendor, 8: Tags, 9: Collections, 10: Master image

        const spuid = fields[0]?.trim();
        const handle = fields[2]?.trim();
        const title = fields[3]?.trim();
        const subtitle = fields[4]?.trim() || '';
        const tags = fields[8]?.trim() || '';
        const masterImage = fields[10]?.trim() || '';

        // 只处理主产品行（有 Title 且未重复）
        if (title && title.length > 5 && handle && !seenHandles.has(handle)) {
            // 检查是否是有效的产品标题（不是列说明）
            if (title.includes('FM0') || title.toLowerCase().includes('crochet')) {
                seenHandles.add(handle);
                products.push({
                    spuid,
                    handle,
                    title,
                    subtitle,
                    tags: tags.split(',').map(t => t.trim()).filter(t => t),
                    masterImage
                });
            }
        }
    }

    console.log(`Found ${products.length} unique products`);
    return products;
}

/**
 * 读取应用场景定义
 */
function readScenarios(jsonPath) {
    console.log('Reading scenarios from:', jsonPath);
    const content = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(content);

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

    console.log(`Found ${scenarios.length} scenarios`);
    return scenarios;
}

/**
 * 读取调研数据
 */
function readResearchData(jsonPath) {
    console.log('Reading research data from:', jsonPath);
    if (!fs.existsSync(jsonPath)) {
        console.warn('Research data file not found!');
        return { scenarios: {} };
    }
    const content = fs.readFileSync(jsonPath, 'utf-8');
    return JSON.parse(content);
}

/**
 * 生成新页面标识符
 */
function generatePageIdentifiers(product, scenario) {
    // 清理产品标题（移除 SKU 编号）
    let cleanTitle = product.title
        .replace(/\s*-\s*FM\d+\s*/gi, '')
        .replace(/\s*FM\d+\s*/gi, '')
        .trim();

    // 生成新标题
    const newTitle = `${cleanTitle} ${scenario.title_suffix}`;

    // 生成新 Handle
    const newHandle = `${scenario.id}-${product.handle}`
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 80); // 限制长度

    return { newTitle, newHandle, cleanTitle };
}

/**
 * 生成 SEO 内容
 */
function generateSeoContent(product, scenario, newTitle, cleanTitle) {
    // SEO Title（60字符限制）
    let seoTitle = newTitle;
    if (seoTitle.length > 55) {
        seoTitle = `${cleanTitle.substring(0, 40)} ${scenario.title_suffix}`;
    }
    seoTitle = seoTitle.length > 60 ? seoTitle.substring(0, 57) + '...' : seoTitle + ' | Wholesale';

    // SEO Description（155字符限制）
    const desc = product.subtitle || product.title;
    const seoDescription = `Wholesale ${scenario.name_en}: ${cleanTitle}. ${desc.substring(0, 60)}. MOQ 100 pcs. Imitation Hand Crochet quality.`.substring(0, 155);

    return { seoTitle, seoDescription };
}

/**
 * 生成丰富的 HTML 描述
 */
function generateRichDescription(product, scenario, cleanTitle, research) {
    // 获取场景特定的调研数据，如果没有则使用默认值
    const scenarioData = research.scenarios[scenario.id] || {
        keywords: [],
        pain_points: [
            "Quality consistency in handmade products",
            "High Minimum Order Quantities",
            "Slow production times"
        ],
        faqs: [],
        trust_badges: ["Handmade Look", "Wholesale Pricing"]
    };

    // 构建 Pain Points 列表 HTML
    const painPointsHtml = scenarioData.pain_points.map(point =>
        `<li><strong>${point.split(' ')[0]}...:</strong> ${point}</li>`
    ).join('\n            ');

    // 构建 FAQ 列表 HTML
    const faqHtml = scenarioData.faqs.map(faq => `
        <details>
            <summary>${faq.question}</summary>
            <p>${faq.answer}</p>
        </details>`).join('');

    // 构建 Trust Badges 字符串
    const trustBadgesStr = scenarioData.trust_badges.map(b => `✓ ${b}`).join(' | ');

    // 构建关键词段落 (SEO)
    const keywordsStr = scenarioData.keywords.join(', ');

    const html = `
<div class="pseo-landing-page">
    <h2>Premium ${cleanTitle} for ${scenario.name_en}</h2>
    
    <div class="why-choose">
        <h3>Why Choose Our ${cleanTitle} for ${scenario.name_en}?</h3>
        <ul>
            ${painPointsHtml}
            <li><strong>Imitation Hand Crochet:</strong> Machine-crafted with authentic handmade look, ensuring consistency and durability</li>
            <li><strong>Premium Materials:</strong> 50-60% Cotton / 40-50% Acrylic blend for comfort and durability</li>
            <li><strong>MOQ:</strong> Starting from 100 pieces per style</li>
            <li><strong>Fast Turnaround:</strong> 2-3 weeks production time for repeat orders</li>
            <li><strong>Customization:</strong> Color, size, and label customization available</li>
        </ul>
    </div>
    
    <div class="perfect-for">
        <h3>Perfect For ${scenario.name_en} Collections</h3>
        <p>This ${cleanTitle.toLowerCase()} is specifically designed for the <strong>${scenario.name_en}</strong> market. 
        Whether you are a boutique owner or a large retailer, our crochet pieces address key industry needs.</p>
        <p><strong>Related Keywords:</strong> ${keywordsStr}</p>
    </div>
    
    <div class="faq-section">
        <h3>Frequently Asked Questions</h3>
        ${faqHtml}
        <details>
            <summary>What is the minimum order quantity?</summary>
            <p>Our MOQ is 100 pieces per style/color. For mixed orders, please contact us for flexible arrangements.</p>
        </details>
    </div>
    
    <div class="trust-badges">
        <p>${trustBadgesStr}</p>
    </div>
</div>
`;

    return html.trim();
}

/**
 * 主函数
 */
async function main() {
    console.log('='.repeat(60));
    console.log('🧶 Crochet Clothing pSEO Matrix Generator v2');
    console.log('='.repeat(60));

    // 1. 读取产品
    const products = readProducts(CONFIG.inputCsvPath);

    if (products.length === 0) {
        console.error('❌ No products found! Check CSV parsing.');
        return;
    }

    // 打印示例产品
    console.log('\nSample products:');
    products.slice(0, 3).forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.title} (${p.handle})`);
    });

    // 2. 读取场景
    const scenarios = readScenarios(CONFIG.scenariosPath);

    // 3. 读取调研数据
    const researchData = readResearchData(CONFIG.researchPath);

    // 4. 生成矩阵（每个产品 × 每个场景）
    console.log('\nGenerating full product-scenario matrix...');
    const matrix = [];
    const stats = {
        totalCombinations: 0,
        byScenario: {}
    };

    for (const product of products) {
        // 每个产品覆盖所有场景
        for (const scenario of scenarios) {
            const { newTitle, newHandle, cleanTitle } = generatePageIdentifiers(product, scenario);
            const { seoTitle, seoDescription } = generateSeoContent(product, scenario, newTitle, cleanTitle);
            const richDescription = generateRichDescription(product, scenario, cleanTitle, researchData);

            // 获取该场景的调研数据用于元字段
            const sData = researchData.scenarios[scenario.id] || {};

            const entry = {
                originalHandle: product.handle,
                originalTitle: product.title,
                originalTags: product.tags,
                masterImage: product.masterImage,

                scenarioId: scenario.id,
                scenarioName: scenario.name_en,
                scenarioCategory: scenario.categoryName,

                newHandle,
                newTitle,
                seoTitle,
                seoDescription,
                richDescription,

                // 元字段数据 (Arrays)
                meta_pain_points: sData.pain_points || [],
                meta_faqs: sData.faqs ? sData.faqs.map(f => `Q: ${f.question} A: ${f.answer}`) : [],
                meta_trust_badges: sData.trust_badges || [],
                meta_keywords: sData.keywords || [],

                status: 'ready',
                createdAt: new Date().toISOString()
            };

            matrix.push(entry);
            stats.totalCombinations++;
            stats.byScenario[scenario.id] = (stats.byScenario[scenario.id] || 0) + 1;
        }
    }

    // 5. 保存矩阵
    console.log('\nSaving matrix...');
    fs.writeFileSync(CONFIG.outputMatrixPath, JSON.stringify(matrix, null, 2), 'utf-8');
    console.log(`Matrix saved to: ${CONFIG.outputMatrixPath}`);

    // 6. 保存待处理列表
    const pending = matrix.filter(m => m.status === 'ready');
    fs.writeFileSync(CONFIG.outputPendingPath, JSON.stringify(pending, null, 2), 'utf-8');
    console.log(`Pending list saved to: ${CONFIG.outputPendingPath}`);

    // 7. 打印统计
    console.log('\n' + '='.repeat(60));
    console.log('📊 Generation Statistics');
    console.log('='.repeat(60));
    console.log(`Products: ${products.length}`);
    console.log(`Scenarios: ${scenarios.length}`);
    console.log(`Total pSEO pages: ${stats.totalCombinations}`);
    console.log('\nBy scenario:');
    for (const [scenarioId, count] of Object.entries(stats.byScenario)) {
        console.log(`  - ${scenarioId}: ${count} pages`);
    }

    console.log('\n✅ Matrix generation complete!');
}

main().catch(console.error);
