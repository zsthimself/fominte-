/**
 * pSEO 新产品 CSV 导出脚本
 * 
 * 功能：
 * - 读取产品×场景矩阵（已填充 pSEO 内容）
 * - 生成符合 Shopline 导入格式的 CSV
 * - 支持增量导出（只导出已完成的条目）
 * 
 * 用法：node export-new-products.js
 */

import fs from 'fs';
import path from 'path';
import { stringify } from 'csv-stringify/sync';

// 配置
const CONFIG = {
    matrixPath: path.join(process.cwd(), '..', '..', 'data', 'pending-pseo-pages.json'),
    outputCsvPath: path.join(process.cwd(), '..', '..', 'data', 'pseo-new-products.csv'),
    // 只导出已完成的条目
    onlyCompleted: false
};

// 类别中英文翻译
const CATEGORY_TRANSLATION = {
    '礼服与正装类': 'Formal Wear & Evening Gowns',
    '民族传统服饰类': 'Ethnic & Traditional Wear',
    '民族与传统服饰类': 'Ethnic & Traditional Wear',
    '婚庆与新娘类': 'Bridal & Wedding',
    '舞台表演类': 'Performance & Stage',
    '儿童礼服类': 'Children\'s Formal Wear'
};

// 场景数据（规格与 Banner）
const SCENARIO_DATA = {
    'evening-gown': {
        spec: 'Composition: 100% Polyester | Width: 130cm | Weight: 280gsm | Technics: Embroidered with Sequins',
        banner: ''
    },
    'cocktail-dress': {
        spec: 'Composition: Polyester/Spandex | Width: 140cm | Weight: 220gsm | Feature: Stretch & Drape',
        banner: ''
    },
    'haute-couture': {
        spec: 'Composition: Silk/Polyester Blend | Width: 135cm | Weight: 320gsm | Technics: Hand-beaded 3D Flowers',
        banner: ''
    },
    'wedding-dress': {
        spec: 'Composition: 100% Nylon Mesh base | Width: 130cm | Weight: 250gsm | Technics: Heavy Beading & Pearls',
        banner: ''
    },
    'reception-dress': {
        spec: 'Composition: Satin/Tulle | Width: 140cm | Weight: 200gsm | Feature: Elegant Shine & Soft Hand',
        banner: ''
    },
    'bridesmaid-dress': {
        spec: 'Composition: Chiffon/Polyester | Width: 150cm | Weight: 120gsm | Feature: Flowy & Breathable',
        banner: ''
    },
    'bridal-veil': {
        spec: 'Composition: 100% Soft Tulle | Width: 300cm | Weight: 20gsm | Feature: Ultra Sheer & Lightweight',
        banner: ''
    },
    'bridal-robe': {
        spec: 'Composition: Silk Satin | Width: 110cm | Weight: 19mm | Feature: Smooth Surface & Lustrous',
        banner: ''
    },
    'abaya-kaftan': {
        spec: 'Composition: Nida/Crepe | Width: 150cm | Weight: 180gsm | Technics: Gold Thread Embroidery',
        banner: ''
    },
    'saree-lehenga': {
        spec: 'Composition: Net/Georgette | Width: 110cm | Weight: 240gsm | Technics: Zari Work & Stone Embellishment',
        banner: ''
    },
    'kebaya-kurung': {
        spec: 'Composition: Cotton/Lace | Width: 130cm | Weight: 160gsm | Feature: Intricate Floral Patterns',
        banner: ''
    },
    'ballroom-latin': {
        spec: 'Composition: Spandex/Lycra | Width: 150cm | Weight: 280gsm | Feature: 4-Way Stretch & High Recovery',
        banner: ''
    },
    'figure-skating': {
        spec: 'Composition: Velvet/Mesh | Width: 150cm | Weight: 260gsm | Feature: Thermal & Stretch',
        banner: ''
    },
    'stage-costume': {
        spec: 'Composition: Metallic Brocade | Width: 140cm | Weight: 300gsm | Feature: Structured & Reflective',
        banner: ''
    },
    'flower-girl': {
        spec: 'Composition: Organza/Satin | Width: 140cm | Weight: 150gsm | Feature: Soft Structure & Volume',
        banner: ''
    },
    'pageant-dress': {
        spec: 'Composition: Glitz Tulle | Width: 130cm | Weight: 220gsm | Technics: Fully Sequined',
        banner: ''
    },
    'christening-gown': {
        spec: 'Composition: 100% Cotton Batiste | Width: 110cm | Weight: 80gsm | Feature: Soft & Heirloom Quality',
        banner: ''
    }
};

/**
 * 读取矩阵数据
 */
function readMatrix() {
    const content = fs.readFileSync(CONFIG.matrixPath, 'utf-8');
    return JSON.parse(content);
}

/**
 * 生成 CSV 记录
 */
function generateCsvRecords(matrix) {
    const records = [];

    for (const item of matrix) {
        // 如果设置了只导出已完成，跳过 pending 状态
        if (CONFIG.onlyCompleted && item.status === 'pending') {
            continue;
        }

        // 生成产品描述 HTML
        const description = generateDescription(item);

        // 生成标签（仅英文）
        const tags = generateTags(item);

        // 翻译 target_industry 为英文
        const targetIndustryEn = CATEGORY_TRANSLATION[item.targetIndustry] || item.targetIndustry;

        // 获取场景特定数据（规格和 Banner）
        const scenarioData = SCENARIO_DATA[item.scenarioId] || {};
        const materialSpec = scenarioData.spec || '';
        const bannerImage = scenarioData.banner || ''; // 如果为空，前端可能需要回退逻辑或显示默认图

        // 标题清洗与优化
        let cleanTitle = item.newTitle;
        // 1. 去除 SKU (例如 FT25-265-1)
        cleanTitle = cleanTitle.replace(/FT\d+-\d+-\d+/gi, 'Embroidery Fabric');
        // 2. 确保包含核心关键词
        if (!cleanTitle.toLowerCase().includes('embroidery fabric')) {
            cleanTitle = cleanTitle.replace(/Luxury/i, 'Luxury Embroidery Fabric');
        }
        // 3. 清理多余空格和标点
        cleanTitle = cleanTitle.replace(/\s+/g, ' ').replace(/\|\s*\|/g, '|').trim();

        // 同样清洗 SEO 标题
        let cleanSeoTitle = item.seoTitle || `Premium Fabric ${item.scenarioName} | B2B Wholesale`;
        cleanSeoTitle = cleanSeoTitle.replace(/FT\d+-\d+-\d+/gi, 'Embroidery Fabric');
        if (!cleanSeoTitle.toLowerCase().includes('embroidery fabric')) {
            // 如果 SEO 标题里没有这个词，尝试替换 Luxury 或插在最前面
            if (cleanSeoTitle.includes('Luxury')) {
                cleanSeoTitle = cleanSeoTitle.replace(/Luxury/i, 'Luxury Embroidery Fabric');
            } else {
                cleanSeoTitle = `Embroidery Fabric ${cleanSeoTitle}`;
            }
        }
        cleanSeoTitle = cleanSeoTitle.replace(/\s+/g, ' ').replace(/\|\s*\|/g, '|').trim();

        records.push({
            'Handle': item.newHandle,
            'Title*': cleanTitle,
            'Subtitle': '',
            'Product description html': description,
            'SPU': '',
            'Vendor': 'fominte',
            'Tags': tags,
            'Collections': '',  // 留空，不分配集合，避免前端可见
            'Master image': item.masterImage,
            'Image Alt Text': cleanTitle,
            'SEO title': cleanSeoTitle,
            'SEO description': generateSeoDescription(item),
            'SEO keywords': item.scenarioName,
            'Published': 'Y',
            'Status': 'Y',
            'Standardized Product Type': '', // 留空，不归入现有分类
            'Custom Product Type': 'pSEO Landing Page',
            'SKU': `${item.originalSku}-${item.scenarioId}`,
            'Option1 name': '',
            'Option1 value': '',
            'SKU price': '0.00',
            'SKU compare at price': '',
            'SKU weight': '0',
            'SKU weight unit': 'g',
            'SKU Inventory Tracker': 'F',
            'SKU Inventory Policy': 'deny',
            'SKU Inventory Quantity': '0',
            // pSEO 元字段
            'custom.application': item.scenarioName,
            'custom.seo_title': cleanSeoTitle,
            'custom.target_industry': targetIndustryEn,
            'custom.scene_image': bannerImage, // 使用场景专属 Banner
            'custom.material_spec': materialSpec, // 使用场景专属规格
            'custom.trust_badge': item.trustBadge || 'Oeko-Tex Standard 100||ISO 9001 Certified||Factory Direct||30+ Years Export',
            'custom.pain_point': item.painPoints || '',
            'custom.faq': item.faq || ''
        });
    }

    return records;
}

/**
 * 根据场景获取集合 Handle
 */
function getCollectionForScenario(scenarioId) {
    const collectionMap = {
        'evening-gown': 'evening-gowns,pseo-landing-pages',
        'cocktail-dress': 'cocktail-dresses,pseo-landing-pages',
        'haute-couture': 'haute-couture,pseo-landing-pages',
        'wedding-dress': 'weddings,bridal,pseo-landing-pages',
        'reception-dress': 'weddings,reception-dresses,pseo-landing-pages',
        'bridesmaid-dress': 'weddings,bridesmaid,pseo-landing-pages',
        'bridal-veil': 'weddings,bridal-veils,pseo-landing-pages',
        'bridal-robe': 'weddings,bridal-robes,pseo-landing-pages',
        'abaya-kaftan': 'kaftans-abayas,middle-eastern-couture,pseo-landing-pages',
        'saree-lehenga': 'saris-lehengas,pseo-landing-pages',
        'kebaya-kurung': 'kebaya,pseo-landing-pages',
        'ballroom-latin': 'dance,ballroom,pseo-landing-pages',
        'figure-skating': 'skating,pseo-landing-pages',
        'stage-costume': 'costumes,pseo-landing-pages',
        'flower-girl': 'flower-girl,children,pseo-landing-pages',
        'pageant-dress': 'pageant,children,pseo-landing-pages',
        'christening-gown': 'christening,children,pseo-landing-pages'
    };

    return collectionMap[scenarioId] || 'pseo-landing-pages';
}

/**
 * 生成产品描述 HTML (SEO 丰富版)
 */
function generateDescription(item) {
    const scenarioName = item.scenarioName;
    const categoryName = CATEGORY_TRANSLATION[item.categoryName] || item.categoryName;
    const scenarioData = SCENARIO_DATA[item.scenarioId] || {};
    const spec = scenarioData.spec || 'Premium Quality Fabric';

    return `
    <h2>Premium Fabric for ${scenarioName}</h2>
    <p>Elevate your collection with our premium fabric specifically curated for <strong>${scenarioName}</strong>. Designed for the modern <strong>${categoryName}</strong> market, this material offers the perfect balance of aesthetics and performance. Whether you are a fashion designer, a boutique owner, or a garment manufacturer, this fabric provides the luxurious touch and durability needed to create stunning pieces that stand out.</p>

    <h3>Design Inspiration & Trends</h3>
    <p>In the world of <strong>${scenarioName}</strong>, texture and drape are everything. Our latest collection draws inspiration from global fashion capitals, focusing on sophistication and timeless elegance. This fabric captures the essence of current trends—blending classic craftsmanship with modern textile technology to ensure your designs are both beautiful and wearable.</p>

    <h3>Styling & Application Tips</h3>
    <p>This versatile fabric is ideal for creating:</p>
    <ul>
        <li><strong>Signature Pieces:</strong> Perfect for the main body of ${scenarioName}, providing structure and flow.</li>
        <li><strong>Accents & Details:</strong> Use it for sleeves, overlays, or inserts to add a touch of luxury.</li>
        <li><strong>Custom Creations:</strong> Its adaptability makes it suitable for bespoke and made-to-measure garments.</li>
    </ul>
    <p>We recommend pairing this fabric with complementary linings and high-quality trims to maximize its visual impact.</p>

    <h3>Material & Care Specifications</h3>
    <p><strong>Specifications:</strong> ${spec}</p>
    <p>To maintain the pristine condition of your garments, we recommend the following care instructions:</p>
    <ul>
        <li>Professional dry clean recommended for best results.</li>
        <li>If washing is permitted (check sample), use a gentle cycle with cold water.</li>
        <li>Do not bleach. Iron on low heat if necessary, preferably with a pressing cloth.</li>
        <li>Store in a cool, dry place away from direct sunlight to preserve color vibrancy.</li>
    </ul>

    <h3>Why Choose Fominte for Your ${scenarioName} Needs?</h3>
    <p>At Fominte, we understand the unique challenges of the B2B fashion industry. Our commitment to quality ensures that every yard of fabric meets rigorous standards. With over 30 years of export experience, we are your trusted partner in production.</p>
    <ul>
        <li><strong>Factory Direct Pricing:</strong> Get the best value without compromising on quality.</li>
        <li><strong>Low MOQ:</strong> Flexible ordering options to support businesses of all sizes.</li>
        <li><strong>Global Shipping:</strong> Reliable logistics to get your fabric where you need it, when you need it.</li>
    </ul>
    `;
}

/**
 * 生成标签（仅英文）
 */
function generateTags(item) {
    // 翻译中文类别名为英文
    const categoryNameEn = CATEGORY_TRANSLATION[item.categoryName] || item.categoryName;

    const baseTags = [
        item.scenarioName,
        categoryNameEn,
        'pSEO',
        'B2B',
        'Wholesale'
    ];

    // 从原始标签中提取关键词（过滤中文）
    const originalTags = item.originalTags.split(',')
        .map(t => t.trim())
        .filter(t => !/[\u4e00-\u9fa5]/.test(t))  // 过滤掉包含中文的标签
        .slice(0, 10);

    return [...new Set([...baseTags, ...originalTags])].join(',');
}

/**
 * 生成 SEO 描述
 */
function generateSeoDescription(item) {
    return `Premium ${item.scenarioName} fabric from Fominte. Wholesale B2B supplier with factory-direct pricing. ` +
        `OEKO-TEX certified, 30+ years export experience. Contact us for samples and quotes.`;
}

/**
 * 主函数
 */
function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('   pSEO 新产品 CSV 导出器');
    console.log('═══════════════════════════════════════════════════════════\n');

    // 读取矩阵
    console.log('📦 读取产品×场景矩阵...');
    const matrix = readMatrix();
    console.log(`   找到 ${matrix.length} 个组合\n`);

    // 统计状态
    const pending = matrix.filter(m => m.status === 'pending').length;
    const completed = matrix.filter(m => m.status === 'completed').length;
    console.log(`   待处理: ${pending}`);
    console.log(`   已完成: ${completed}\n`);

    // 生成 CSV 记录
    console.log('📝 生成 CSV 记录...');
    const records = generateCsvRecords(matrix);
    console.log(`   生成 ${records.length} 条记录\n`);

    if (records.length === 0) {
        console.log('⚠️  没有可导出的记录');
        return;
    }

    // 写入 CSV
    const columns = Object.keys(records[0]);
    const csv = stringify(records, {
        header: true,
        columns: columns
    });

    fs.writeFileSync(CONFIG.outputCsvPath, csv, 'utf-8');
    console.log(`✅ CSV 已导出: ${CONFIG.outputCsvPath}`);
    console.log(`   共 ${records.length} 条记录`);
}

main();
