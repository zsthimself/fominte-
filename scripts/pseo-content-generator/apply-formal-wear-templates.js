/**
 * 礼服与正装类 pSEO 内容模板应用脚本
 * 场景：evening-gown, cocktail-dress, haute-couture
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 场景模板定义（基于 SEO 调研结果）
const scenarioTemplates = {
    'evening-gown': {
        seoTitle: 'Premium {productSku} for Evening Gowns | Luxury Fabric Wholesale B2B',
        painPoints: '✨ Exquisite drape & movement for red carpet elegance||🎨 Rich textures: satin sheen, velvet depth, beaded sparkle||⚡ Consistent dye lots for bulk production runs||🌍 Direct factory pricing with flexible MOQ',
        faq: 'Q: What fabrics work best for evening gowns? A: Satin, silk, chiffon, velvet, and embellished lace are top choices for luxurious drape and elegant flow.||Q: Do you offer custom colors for bulk orders? A: Yes, we provide custom dyeing services for orders over 50 meters with OEKO-TEX certified processes.||Q: What is your MOQ for wholesale orders? A: We offer flexible MOQs starting from 5 meters for sampling, with bulk discounts at 50+ meters.',
        trustBadge: 'OEKO-TEX Certified||10+ Years B2B Experience||Direct Factory Pricing||Global Shipping Available'
    },
    'cocktail-dress': {
        seoTitle: 'Premium {productSku} for Cocktail & Prom Dresses | B2B Fabric Supplier',
        painPoints: '✨ Vibrant colors & shimmer for party-ready glamour||🎨 Versatile weights: from flowing chiffon to structured satin||⚡ Sample swatches available for color matching||🌍 Fast turnaround for seasonal collections',
        faq: 'Q: Which fabrics are ideal for cocktail dresses? A: Sequin fabrics, stretch satin, embroidered tulle, and lightweight crepe create stunning party looks.||Q: Can I get samples before bulk ordering? A: Yes, we offer sample swatches and small yardage orders before committing to bulk purchases.||Q: Do you supply fabrics for prom season collections? A: Absolutely! We specialize in trend-forward fabrics for formal occasion wear with seasonal availability.',
        trustBadge: 'Sample Program Available||Trend-Forward Designs||Competitive B2B Pricing||Rush Orders Welcome'
    },
    'haute-couture': {
        seoTitle: 'Luxury {productSku} for Haute Couture | Designer Fabric Wholesale',
        painPoints: '✨ Hand-crafted embellishments: beading, sequins, 3D florals||🎨 Exclusive designs from French-style Chantilly to heavy beaded lace||⚡ Small batch production for emerging designers||🌍 Premium materials meeting European quality standards',
        faq: 'Q: What makes a fabric suitable for haute couture? A: Hand-beaded embroidery, exclusive lace patterns, premium silk bases, and meticulous craftsmanship define couture-grade fabrics.||Q: Do you support small-batch orders for designers? A: Yes, we offer flexible MOQs and support emerging designers with small production runs.||Q: Are your fabrics runway-ready? A: Our haute couture collection is crafted for fashion shows and high-end bridal, featuring hand-sewn details and luxury finishes.',
        trustBadge: 'Couture-Grade Quality||Hand-Crafted Embellishments||Designer Partnership Program||OEKO-TEX Certified Materials'
    }
};

// 读取待处理矩阵
const matrixPath = path.join(__dirname, '../../data/pending-pseo-pages.json');
const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));

// 统计
let updatedCount = 0;
const targetScenarios = ['evening-gown', 'cocktail-dress', 'haute-couture'];

// 应用模板
matrix.forEach(item => {
    if (targetScenarios.includes(item.scenarioId) && item.status === 'pending') {
        const template = scenarioTemplates[item.scenarioId];
        if (template) {
            // 替换产品 SKU 占位符
            const productSku = item.originalSku || item.newHandle.split('-for-')[0].toUpperCase();

            item.seoTitle = template.seoTitle.replace('{productSku}', productSku);
            item.painPoints = template.painPoints;
            item.faq = template.faq;
            item.trustBadge = template.trustBadge;
            item.status = 'completed';
            item.generatedAt = new Date().toISOString();

            updatedCount++;
        }
    }
});

// 保存更新后的矩阵
fs.writeFileSync(matrixPath, JSON.stringify(matrix, null, 2), 'utf8');

console.log(`✅ 已更新 ${updatedCount} 个产品×场景组合`);
console.log(`📊 场景分布：`);
targetScenarios.forEach(s => {
    const count = matrix.filter(m => m.scenarioId === s && m.status === 'completed').length;
    console.log(`   - ${s}: ${count}`);
});

// 输出进度
const total = matrix.length;
const completed = matrix.filter(m => m.status === 'completed').length;
const pending = matrix.filter(m => m.status === 'pending').length;
console.log(`\n📈 总体进度: ${completed}/${total} 已完成, ${pending} 待处理`);
