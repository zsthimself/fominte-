/**
 * Shopline pSEO 元字段批量导入工具 v5
 * 
 * 功能：
 * - 读取 CSV 并匹配产品
 * - 自动检测元字段类型
 * - 支持图片 URL 自动上传到 Shopline 文件库
 * - 创建/更新元字段
 * 
 * 用法：npm run import
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// 加载环境变量
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && !key.startsWith('#')) {
        env[key.trim()] = valueParts.join('=').trim();
    }
});

// 配置
const CONFIG = {
    storeDomain: env.SHOPLINE_STORE_DOMAIN || 'fominte.myshopline.com',
    accessToken: env.SHOPLINE_ACCESS_TOKEN,
    csvPath: path.join(process.cwd(), '..', '..', 'data', 'pseo-new-products.csv'),
    metafieldVersion: 'v20241201',
    productVersion: 'v20230901',
    fileApiVersion: 'v20241201'
};

// 元字段映射
const METAFIELD_MAPPING = {
    'custom.application': { namespace: 'custom', key: 'application', type: 'single_line_text_field' },
    'custom.seo_title': { namespace: 'custom', key: 'seo_title', type: 'single_line_text_field' },
    'custom.target_industry': { namespace: 'custom', key: 'target_industry', type: 'single_line_text_field' },
    'custom.scene_image': { namespace: 'custom', key: 'scene_image', type: 'file_reference', isImage: true },
    'custom.material_spec': { namespace: 'custom', key: 'material_spec', type: 'single_line_text_field' },
    'custom.trust_badge': { namespace: 'custom', key: 'trust_badge', type: 'single_line_text_field' },
    'custom.pain_point': { namespace: 'custom', key: 'pain_point', type: 'multi_line_text_field' },
    'custom.faq': { namespace: 'custom', key: 'faq', type: 'multi_line_text_field' }
};

// 图片上传缓存（避免重复上传相同 URL）
const uploadedImageCache = new Map();

/**
 * 上传图片到 Shopline 文件库
 */
async function uploadImageToShopline(imageUrl, fileName) {
    // 检查缓存
    if (uploadedImageCache.has(imageUrl)) {
        console.log(`      📦 使用缓存: ${fileName}`);
        return uploadedImageCache.get(imageUrl);
    }

    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.fileApiVersion}/files/files.json`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${CONFIG.accessToken}`
            },
            body: JSON.stringify({
                content_type: 'IMAGE',
                original_source: imageUrl,
                file_name: fileName,
                alt: fileName,
                duplicate_resolution_mode: 'APPEND_UUID'
            })
        });

        const text = await response.text();

        if (response.ok) {
            const data = JSON.parse(text);
            const fileId = data.id;

            // 等待文件处理
            await new Promise(r => setTimeout(r, 1000));

            // 获取文件 URL
            const fileUrl = await getFileUrl(fileId);
            if (fileUrl) {
                uploadedImageCache.set(imageUrl, fileUrl);
                console.log(`      📤 已上传: ${fileName}`);
                return fileUrl;
            }
        }
    } catch (error) {
        console.log(`      ❌ 上传失败: ${error.message}`);
    }

    // 如果上传失败，返回原始 URL
    return imageUrl;
}

/**
 * 获取已上传文件的 URL
 */
async function getFileUrl(fileId) {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.fileApiVersion}/files/${fileId}.json`;

    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${CONFIG.accessToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.url;
        }
    } catch { }

    return null;
}

/**
 * 获取产品列表
 */
async function getProducts() {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.productVersion}/products/products.json?limit=250`;

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.accessToken}`
        }
    });

    if (!response.ok) throw new Error(`获取产品失败: ${response.status}`);
    const data = await response.json();
    return data.products || [];
}

/**
 * 获取产品现有元字段
 */
async function getProductMetafields(productId) {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.metafieldVersion}/products/${productId}/metafields.json`;

    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.accessToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.metafields || [];
        }
    } catch { }

    return [];
}

/**
 * 创建产品元字段
 */
async function createProductMetafield(productId, metafield) {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.metafieldVersion}/products/${productId}/metafields.json`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${CONFIG.accessToken}`
        },
        body: JSON.stringify({
            metafield: {
                namespace: metafield.namespace,
                key: metafield.key,
                value: metafield.value,
                type: metafield.type
            }
        })
    });

    if (response.ok) return { success: true, key: metafield.key };

    const text = await response.text();
    return { success: false, key: metafield.key, error: text.substring(0, 100) };
}

/**
 * 更新产品元字段
 */
async function updateProductMetafield(productId, metafieldId, metafield) {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.metafieldVersion}/products/${productId}/metafields/${metafieldId}.json`;

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${CONFIG.accessToken}`
        },
        body: JSON.stringify({
            metafield: {
                id: metafieldId,
                value: metafield.value,
                type: metafield.type
            }
        })
    });

    if (response.ok) return { success: true, key: metafield.key, updated: true };

    const text = await response.text();
    return { success: false, key: metafield.key, error: text.substring(0, 100) };
}

/**
 * 判断是否为外部图片 URL（需要上传）
 */
function isExternalImageUrl(value) {
    if (!value || typeof value !== 'string') return false;
    // Shopline 文件库的 URL 不需要上传
    if (value.includes('myshopline.com')) return false;
    // 检查是否为图片 URL
    return value.match(/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i) ||
        value.match(/^https?:\/\/(images\.unsplash\.com|cdn\.|img\.)/i);
}

/**
 * 通过 Handle 查找产品
 */
function findProductByHandle(products, handle) {
    return products.find(p => p.handle === handle);
}

/**
 * 处理单个产品
 */
async function processProduct(row, products) {
    const handle = row['Handle'];

    if (!handle) return { success: false, reason: 'missing_handle' };

    console.log(`\n📦 处理: ${handle}`);

    const product = findProductByHandle(products, handle);

    if (!product) {
        console.log('   ❌ 未找到产品');
        return { success: false, reason: 'product_not_found', handle };
    }

    console.log(`   ✓ ID: ${product.id}`);

    // 获取现有元字段
    const existingMetafields = await getProductMetafields(product.id);
    const existingMap = new Map();
    for (const mf of existingMetafields) {
        existingMap.set(`${mf.namespace}.${mf.key}`, mf);
    }

    // 准备元字段
    const metafields = [];
    for (const [csvColumn, mfConfig] of Object.entries(METAFIELD_MAPPING)) {
        let value = row[csvColumn];
        if (!value || !value.trim()) continue;

        value = value.trim();

        // 如果是图片字段且为外部 URL，先上传到 Shopline
        if (mfConfig.isImage && isExternalImageUrl(value)) {
            console.log(`   🖼️  处理图片: ${csvColumn}`);
            const fileName = `${handle}_${mfConfig.key}`;
            value = await uploadImageToShopline(value, fileName);
        }

        metafields.push({
            namespace: mfConfig.namespace,
            key: mfConfig.key,
            value: value,
            type: mfConfig.type,
            existingId: existingMap.get(csvColumn)?.id
        });
    }

    if (metafields.length === 0) {
        console.log('   ⚠️  无元字段');
        return { success: true, reason: 'no_metafields', handle };
    }

    console.log(`   📝 处理 ${metafields.length} 个元字段...`);

    let successCount = 0;
    let updatedCount = 0;

    for (const mf of metafields) {
        let result;

        if (mf.existingId) {
            result = await updateProductMetafield(product.id, mf.existingId, mf);
            if (result.success) {
                updatedCount++;
                console.log(`      ↻ ${mf.key}`);
            }
        } else {
            result = await createProductMetafield(product.id, mf);
            if (result.success) {
                successCount++;
                console.log(`      ✓ ${mf.key}`);
            }
        }

        if (!result.success) {
            console.log(`      ✗ ${mf.key}: ${result.error}`);
        }

        await new Promise(r => setTimeout(r, 200));
    }

    return {
        success: successCount + updatedCount > 0,
        handle,
        created: successCount,
        updated: updatedCount,
        total: metafields.length
    };
}

/**
 * 主函数
 */
async function main() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('   Shopline pSEO 元字段批量导入工具 v5');
    console.log('   支持自动上传图片到 Shopline 文件库');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`\n📁 CSV: ${CONFIG.csvPath}`);
    console.log(`🏪 店铺: ${CONFIG.storeDomain}`);

    if (!CONFIG.accessToken) {
        console.error('\n❌ 错误: 未配置 SHOPLINE_ACCESS_TOKEN');
        process.exit(1);
    }

    if (!fs.existsSync(CONFIG.csvPath)) {
        console.error(`\n❌ 错误: CSV 文件不存在`);
        process.exit(1);
    }

    // 读取 CSV
    const csvContent = fs.readFileSync(CONFIG.csvPath, 'utf-8');
    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        bom: true
    });

    console.log(`📊 CSV 记录数: ${records.length}`);

    // 获取产品列表
    console.log('\n📦 获取产品列表...');
    const products = await getProducts();
    console.log(`📦 店铺产品数: ${products.length}`);

    if (products.length === 0) {
        console.error('\n❌ 店铺没有产品');
        process.exit(1);
    }

    console.log('───────────────────────────────────────────────────────');

    // 处理每个产品
    const results = { success: [], failed: [], skipped: [] };

    for (const row of records) {
        try {
            const result = await processProduct(row, products);

            if (result.success) {
                if (result.reason === 'no_metafields') {
                    results.skipped.push(result);
                } else {
                    results.success.push(result);
                }
            } else {
                results.failed.push(result);
            }

            await new Promise(r => setTimeout(r, 300));
        } catch (error) {
            console.error(`   ❌ 错误: ${error.message}`);
            results.failed.push({ handle: row['Handle'], error: error.message });
        }
    }

    // 输出统计
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('   导入完成！');
    console.log('═══════════════════════════════════════════════════════');

    const totalCreated = results.success.reduce((sum, r) => sum + (r.created || 0), 0);
    const totalUpdated = results.success.reduce((sum, r) => sum + (r.updated || 0), 0);

    console.log(`\n   ✅ 成功产品: ${results.success.length}`);
    console.log(`      - 新建: ${totalCreated}`);
    console.log(`      - 更新: ${totalUpdated}`);
    console.log(`   ⚠️  跳过: ${results.skipped.length}`);
    console.log(`   ❌ 失败: ${results.failed.length}`);

    if (results.failed.length > 0) {
        console.log('\n失败详情:');
        results.failed.forEach(f => {
            console.log(`   - ${f.handle}: ${f.reason || f.error}`);
        });
    }
}

main().catch(console.error);
