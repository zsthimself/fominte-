/**
 * 民族传统服饰类 pSEO 内容模板应用脚本
 * 场景：abaya-kaftan, saree-lehenga
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 场景模板定义（基于 SEO 调研结果）
const scenarioTemplates = {
    'abaya-kaftan': {
        seoTitle: 'Premium {productSku} for Abayas & Kaftans | Wholesale Fabric Supplier Dubai',
        painPoints: '✨ Elegant drape & flow for modest fashion excellence||🎨 Rich textures: Nida smoothness, crepe elegance, chiffon grace||⚡ Consistent quality for Gulf & Middle East markets||🌍 Factory-direct pricing with global shipping to UAE, Saudi, Qatar',
        faq: 'Q: What fabrics are best for abayas? A: Nida, crepe, chiffon, and satin are the most popular choices for their smooth texture, elegant drape, and comfort in warm climates.||Q: Do you ship to Dubai and the Middle East? A: Yes, we offer global shipping with specialized service to UAE, Saudi Arabia, Qatar, Kuwait, and other Gulf countries.||Q: What is your minimum order for wholesale? A: We offer flexible MOQs starting from 10 meters for sampling, with bulk discounts for larger orders.',
        trustBadge: 'Gulf Market Specialist||Modest Fashion Expertise||Premium Quality Fabrics||Direct Factory Pricing'
    },
    'saree-lehenga': {
        seoTitle: 'Premium {productSku} for Sarees & Lehengas | B2B Wedding Fabric Wholesale India',
        painPoints: '✨ Luxurious embroidery & embellishments for bridal grandeur||🎨 Rich fabrics: silk shimmer, georgette flow, velvet opulence||⚡ Festive & wedding-ready with zari, sequins, and intricate work||🌍 Surat-quality craftsmanship with international shipping',
        faq: 'Q: Which fabrics are ideal for wedding sarees and lehengas? A: Silk, georgette, velvet, organza, and brocade are most popular for their luxurious appearance and ability to showcase intricate embroidery.||Q: Do you offer customized embroidery for bulk orders? A: Yes, we provide custom embroidery, zari work, and embellishment services for wholesale orders.||Q: Can you supply for Diwali and wedding season collections? A: Absolutely! We specialize in festive and bridal collections with timely delivery for peak seasons.',
        trustBadge: 'Indian Wedding Specialist||Surat Quality Craftsmanship||Festive Collection Ready||Bulk Order Discounts'
    }
};

// 读取待处理矩阵
const matrixPath = path.join(__dirname, '../../data/pending-pseo-pages.json');
const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));

// 统计
let updatedCount = 0;
const targetScenarios = ['abaya-kaftan', 'saree-lehenga'];

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
