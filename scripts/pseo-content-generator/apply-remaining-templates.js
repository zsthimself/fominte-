/**
 * 剩余场景 pSEO 内容模板应用脚本
 * 场景：ballroom-latin, figure-skating, stage-costume, flower-girl, pageant-dress
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 场景模板定义
const scenarioTemplates = {
    // 舞台表演类
    'ballroom-latin': {
        seoTitle: 'Premium {productSku} for Ballroom & Latin Dance | Performance Fabric Wholesale',
        painPoints: '✨ Stretch & flow for dynamic dance movements||🎨 Sparkle & shimmer under stage lights||⚡ Durable construction for competition wear||🌍 Quick-dry fabrics for intensive performances',
        faq: 'Q: What fabrics are best for ballroom and Latin dance costumes? A: Stretch satin, sequin mesh, and flowing chiffon with lycra provide the movement, sparkle, and comfort needed for competitive dance.||Q: Do you offer fabrics with rhinestone compatibility? A: Yes, our dance fabrics are designed to hold rhinestones, sequins, and other embellishments securely.||Q: What colors are popular for Latin dance costumes? A: Vibrant reds, blacks, golds, and jewel tones are most popular for Latin dance, while pastels and metallics suit ballroom styles.',
        trustBadge: 'Dance Costume Specialist||Stretch Performance Fabrics||Competition-Ready Quality||Rhinestone Compatible'
    },
    'figure-skating': {
        seoTitle: 'Premium {productSku} for Figure Skating Costumes | Ice Dance Fabric Wholesale',
        painPoints: '✨ Lightweight stretch for athletic performance||🎨 Crystal-catching sparkle for ice arena lighting||⚡ Cold-resistant materials for rink conditions||🌍 ISU competition-approved quality',
        faq: 'Q: What fabrics work best for figure skating dresses? A: Stretch velvet, power mesh with sequins, and lycra blends offer the stretch, warmth, and sparkle needed for ice performance.||Q: Are your fabrics suitable for competition skating? A: Yes, our fabrics meet competition standards and are used by professional skaters and costume designers worldwide.||Q: Do you have flesh-tone fabrics for illusion effects? A: We offer a range of nude mesh and illusion fabrics in various skin tones for seamless costume designs.',
        trustBadge: 'Ice Sport Specialist||Competition Approved||Stretch & Sparkle||Cold-Resistant Materials'
    },
    'stage-costume': {
        seoTitle: 'Premium {productSku} for Stage Costumes | Theater Fabric Wholesale',
        painPoints: '✨ Dramatic visual impact under stage lighting||🎨 Rich textures from velvet to metallic||⚡ Durable for repeated performances||🌍 Fire-retardant options available',
        faq: 'Q: What fabrics are ideal for theater and stage costumes? A: Velvet, brocade, metallic fabrics, and sequin materials create dramatic effects under stage lights.||Q: Do you offer fire-retardant fabrics for stage use? A: Yes, we provide certified fire-retardant fabric options that meet theater safety standards.||Q: Can you supply large quantities for theater productions? A: Absolutely, we specialize in bulk orders for theater companies and costume houses with consistent quality across large yardage.',
        trustBadge: 'Theater Industry Supplier||Fire-Retardant Options||Stage Lighting Optimized||Bulk Production Ready'
    },
    // 儿童礼服类
    'flower-girl': {
        seoTitle: 'Premium {productSku} for Flower Girl Dresses | Kids Formal Fabric Wholesale',
        painPoints: '✨ Soft, child-friendly fabrics for comfort||🎨 Dreamy tulle & delicate lace for princess looks||⚡ Easy-care materials for practical parenting||🌍 Matching options for bridal party coordination',
        faq: 'Q: What fabrics are best for flower girl dresses? A: Soft tulle, lightweight satin, and gentle lace are ideal for creating comfortable yet beautiful flower girl dresses.||Q: Are your fabrics safe for children with sensitive skin? A: Yes, we offer OEKO-TEX certified fabrics that are tested for harmful substances and safe for children.||Q: Can you match flower girl fabric to bridal gown materials? A: We provide color matching services to ensure flower girl dresses coordinate perfectly with the bride\'s gown.',
        trustBadge: 'Child-Safe Certified||OEKO-TEX Materials||Soft & Comfortable||Bridal Party Matching'
    },
    'pageant-dress': {
        seoTitle: 'Premium {productSku} for Pageant Dresses | Competition Formal Fabric Wholesale',
        painPoints: '✨ Show-stopping sparkle for stage presence||🎨 Luxurious embellishments: crystals, sequins, beading||⚡ Age-appropriate elegance for young contestants||🌍 Competition-winning quality and design',
        faq: 'Q: What fabrics make pageant dresses stand out on stage? A: Heavy beaded fabrics, crystal-embellished lace, and shimmering sequin materials create the maximum visual impact judges look for.||Q: Do you have fabrics suitable for different pageant age divisions? A: Yes, we offer a range from subtle elegance for young girls to glamorous options for teen and adult divisions.||Q: Can you provide matching accessories fabric? A: We offer coordinating fabrics for sashes, hair accessories, and other pageant accessories.',
        trustBadge: 'Pageant Industry Expert||Stage-Worthy Sparkle||Age-Appropriate Options||Competition Proven'
    }
};

// 读取待处理矩阵
const matrixPath = path.join(__dirname, '../../data/pending-pseo-pages.json');
const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));

// 统计
let updatedCount = 0;
const targetScenarios = Object.keys(scenarioTemplates);

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
    if (count > 0) console.log(`   - ${s}: ${count}`);
});

// 输出进度
const total = matrix.length;
const completed = matrix.filter(m => m.status === 'completed').length;
const pending = matrix.filter(m => m.status === 'pending').length;
console.log(`\n📈 总体进度: ${completed}/${total} 已完成, ${pending} 待处理`);

if (pending === 0) {
    console.log(`\n🎉 所有 pSEO 内容生成完成！`);
}
