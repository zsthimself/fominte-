/**
 * 婚庆与新娘类 pSEO 内容模板应用脚本
 * 场景：wedding-dress, reception-dress, bridal-veil
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 场景模板定义（基于 SEO 调研结果）
const scenarioTemplates = {
    'wedding-dress': {
        seoTitle: 'Premium {productSku} for Wedding Dresses | Bridal Fabric Wholesale B2B',
        painPoints: '✨ Romantic elegance with exquisite lace, tulle & embroidery||🎨 Bridal whites: ivory, champagne, blush options available||⚡ 20,000+ original lace designs from Chantilly to 3D beaded||🌍 Consistent quality for bridal manufacturers worldwide',
        faq: 'Q: What fabrics are best for wedding dresses? A: Lace, tulle, satin, organza, and chiffon are the most popular bridal fabrics, each offering unique textures and draping qualities.||Q: Do you offer bridal lace with beading and embroidery? A: Yes, we provide extensive collections from delicate French Chantilly to heavy 3D beaded embroidery, with hand-crafted and machine options.||Q: What are your MOQs for bridal fabric wholesale? A: We offer flexible MOQs starting from 5 meters for sampling, with bulk pricing available for orders over 50 meters.',
        trustBadge: 'Bridal Specialist Since 2010||20,000+ Lace Designs||OEKO-TEX Certified||Premium Quality Guaranteed'
    },
    'reception-dress': {
        seoTitle: 'Premium {productSku} for Reception Dresses | Party Fabric Wholesale',
        painPoints: '✨ Glamorous shimmer for after-party celebration||🎨 Versatile styles: from elegant satin to sparkling sequins||⚡ Comfortable yet stunning for dancing and mingling||🌍 Quick turnaround for bridal boutiques',
        faq: 'Q: What fabrics work best for reception dresses? A: Lighter fabrics like chiffon, crepe, and stretch satin are popular for comfort, while sequins and embellished fabrics add celebration sparkle.||Q: Can I get matching fabrics for the bridal party? A: Yes, we offer consistent dye lots and color matching across different fabric types for coordinated bridal party looks.||Q: Do you have white and ivory options for reception wear? A: We offer the full spectrum of bridal whites including pure white, ivory, champagne, and blush tones.',
        trustBadge: 'Bridal Collection Expert||Color Matching Available||Fast Shipping||Sample Program'
    },
    'bridal-veil': {
        seoTitle: 'Premium {productSku} for Bridal Veils | Tulle Fabric Wholesale Supplier',
        painPoints: '✨ Ultra-soft illusion tulle for dreamy, ethereal veils||🎨 Pure bridal shades: white, off-white, ivory perfection||⚡ Wide-width options: 108" to 120" for cathedral veils||🌍 Premium nylon & polyester blends for lasting beauty',
        faq: 'Q: What fabric is best for bridal veils? A: Soft illusion tulle made from nylon or silk blends offers the most delicate, romantic look with beautiful drape and shine.||Q: Do you offer wide-width tulle for cathedral veils? A: Yes, we stock tulle in widths from 108" to 120", perfect for cathedral and royal-length veils.||Q: What finishes are available for veil tulle? A: We offer matte, shimmer, glitter-infused, pearl-embellished, and metallic finish options.',
        trustBadge: 'Veil Fabric Specialist||Wide-Width Available||Premium Soft Tulle||Bulk Rolls 10-500 Yards'
    }
};

// 读取待处理矩阵
const matrixPath = path.join(__dirname, '../../data/pending-pseo-pages.json');
const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));

// 统计
let updatedCount = 0;
const targetScenarios = ['wedding-dress', 'reception-dress', 'bridal-veil'];

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
