/**
 * Shopline pSEO 产品批量创建与元字段导入工具
 * 
 * 功能：
 * - 读取 pSEO CSV 并创建新产品
 * - 自动添加元字段
 * - 支持图片上传
 * - 跳过已存在的产品
 * 
 * 用法：npm run create-products
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
    csvPath: path.join(process.cwd(), '..', '..', 'data', 'crochet-pseo-new-products.csv'),
    productVersion: 'v20241201',
    metafieldVersion: 'v20241201'
};

// 元字段映射
// 注：scene_image 使用 single_line_text_field 类型（存储图片 URL 字符串）
const METAFIELD_MAPPING = {
    'custom.application': { namespace: 'custom', key: 'application', type: 'single_line_text_field' },
    'custom.seo_title': { namespace: 'custom', key: 'seo_title', type: 'single_line_text_field' },
    'custom.target_industry': { namespace: 'custom', key: 'target_industry', type: 'single_line_text_field' },
    'custom.scene_image': { namespace: 'custom', key: 'scene_image', type: 'single_line_text_field' },
    'custom.material_spec': { namespace: 'custom', key: 'material_spec', type: 'single_line_text_field' },
    'custom.trust_badge': { namespace: 'custom', key: 'trust_badge', type: 'single_line_text_field' },
    'custom.pain_point': { namespace: 'custom', key: 'pain_point', type: 'multi_line_text_field' },
    'custom.faq': { namespace: 'custom', key: 'faq', type: 'multi_line_text_field' }
};

/**
 * 创建产品
 */
async function createProduct(productData) {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.productVersion}/products/products.json`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${CONFIG.accessToken}`
        },
        body: JSON.stringify({ product: productData })
    });

    const text = await response.text();

    if (response.ok) {
        const data = JSON.parse(text);
        return { success: true, product: data.product };
    }

    return { success: false, error: text.substring(0, 200) };
}

/**
 * 获取产品列表（用于检查是否已存在）
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
 * 根据 Handle 获取单个产品
 */
async function getProductByHandle(handle) {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.productVersion}/products/products.json?handle=${handle}`;

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.accessToken}`
        }
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.products && data.products.length > 0 ? data.products[0] : null;
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

    return response.ok;
}

/**
 * 从 CSV 行构建产品数据
 */
function buildProductData(row) {
    // 解析 tags（逗号分隔的字符串）
    const tagsString = row['Tags'] || '';
    const tags = tagsString.split(',').map(t => t.trim()).filter(t => t);

    // 构建产品数据
    const productData = {
        title: row['Title*'] || row['Title'],
        handle: row['Handle'],
        body_html: row['Product description html'] || '',
        vendor: row['Vendor'] || 'fominte',
        product_category: row['Custom Product Type'] || 'pSEO Landing Page',
        status: row['Published'] === 'Y' ? 'active' : 'draft',
        tags: tags
    };

    // 添加摘要
    if (row['Subtitle']) {
        productData.subtitle = row['Subtitle'];
    }

    // 添加图片
    const masterImage = row['Master image'];
    if (masterImage) {
        productData.images = [{
            src: masterImage,
            alt: row['Image Alt Text'] || row['Title*'] || ''
        }];
    }

    // 添加款式（variants）
    const sku = row['SKU'];
    if (sku) {
        productData.variants = [{
            sku: sku,
            price: row['SKU price'] || '0.00',
            compare_at_price: row['SKU compare at price'] || '0.00',
            weight: row['SKU weight'] || '0',
            weight_unit: row['SKU weight unit'] || 'g',
            inventory_tracker: row['SKU Inventory Tracker'] === 'T',
            inventory_policy: row['SKU Inventory Policy'] || 'deny'
        }];
    }

    // SEO 字段
    if (row['SEO title']) {
        productData.seo_title = row['SEO title'];
    }
    if (row['SEO description']) {
        productData.seo_description = row['SEO description'];
    }

    return productData;
}

/**
 * 提取 CSV 行中的元字段数据
 */
function extractMetafields(row) {
    const metafields = [];

    for (const [csvColumn, mfConfig] of Object.entries(METAFIELD_MAPPING)) {
        const value = row[csvColumn];
        if (value && value.trim()) {
            metafields.push({
                namespace: mfConfig.namespace,
                key: mfConfig.key,
                value: value.trim(),
                type: mfConfig.type
            });
        }
    }

    return metafields;
}

/**
 * 更新产品
 */
async function updateProduct(productId, productData) {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.productVersion}/products/${productId}.json`;

    // 仅更新必要的字段
    const updateData = {
        body_html: productData.body_html,
        title: productData.title,
        seo_title: productData.seo_title,
        seo_description: productData.seo_description
    };

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${CONFIG.accessToken}`
        },
        body: JSON.stringify({ product: updateData })
    });

    return response.ok;
}

/**
 * 处理单个 CSV 行
 */
async function processRow(row, existingProductMap) {
    const handle = row['Handle'];

    if (!handle) {
        return { success: false, reason: 'missing_handle' };
    }

    console.log(`\n📦 处理: ${handle}`);

    let productId;
    const productData = buildProductData(row);

    // 检查产品是否已存在
    if (existingProductMap.has(handle)) {
        console.log('   ⚠️ 产品已存在，尝试更新内容和元字段...');
        productId = existingProductMap.get(handle);

        // 更新产品主体信息 (Description, SEO, Title)
        console.log('   🔄 更新产品描述和 SEO 信息...');
        const updateOk = await updateProduct(productId, productData);
        if (updateOk) {
            console.log('      ✓ 产品内容更新成功');
        } else {
            console.log('      ✗ 产品内容更新失败');
        }

    } else {
        // 创建产品
        console.log('   🔨 创建产品...');
        const createResult = await createProduct(productData);

        if (!createResult.success) {
            // 如果是因为 handle 已存在，尝试获取现有产品 ID
            if (createResult.error && createResult.error.includes('handle is already taken')) {
                console.log('   ⚠️ Handle 已存在，尝试获取现有产品 ID...');
                const existingProduct = await getProductByHandle(handle);
                if (existingProduct) {
                    productId = existingProduct.id;
                    console.log(`   ✓ 获取成功 ID: ${productId}，将更新内容和元字段`);

                    // 更新产品主体信息
                    console.log('   🔄 更新产品描述和 SEO 信息...');
                    const updateOk = await updateProduct(productId, productData);
                    if (updateOk) {
                        console.log('      ✓ 产品内容更新成功');
                    } else {
                        console.log('      ✗ 产品内容更新失败');
                    }
                } else {
                    console.log(`   ❌ 创建失败且无法获取现有产品: ${createResult.error}`);
                    return { success: false, reason: 'create_failed_and_lookup_failed', handle, error: createResult.error };
                }
            } else {
                console.log(`   ❌ 创建失败: ${createResult.error}`);
                return { success: false, reason: 'create_failed', handle, error: createResult.error };
            }
        } else {
            productId = createResult.product.id;
            console.log(`   ✓ 创建成功 ID: ${productId}`);
        }
    }

    // 添加元字段
    const metafields = extractMetafields(row);
    if (metafields.length > 0) {
        console.log(`   📝 添加/更新 ${metafields.length} 个元字段...`);

        let mfSuccess = 0;
        for (const mf of metafields) {
            const ok = await createProductMetafield(productId, mf);
            if (ok) {
                mfSuccess++;
                console.log(`      ✓ ${mf.key}`);
            } else {
                console.log(`      ✗ ${mf.key}`);
            }
            await new Promise(r => setTimeout(r, 100));
        }
    }

    return { success: true, handle, productId, metafieldsCount: metafields.length };
}

/**
 * 主函数
 */
/**
 * 主函数
 */
async function main() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('   Shopline pSEO 产品批量创建工具');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`\n📁 CSV: ${CONFIG.csvPath}`);
    console.log(`🏪 店铺: ${CONFIG.storeDomain}`);

    if (!CONFIG.accessToken) {
        console.error('\n❌ 错误: 未配置 SHOPLINE_ACCESS_TOKEN');
        process.exit(1);
    }

    if (!fs.existsSync(CONFIG.csvPath)) {
        console.error(`\n❌ 错误: CSV 文件不存在: ${CONFIG.csvPath}`);
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

    // 获取现有产品
    console.log('\n📦 获取现有产品列表...');
    const existingProducts = await getProducts();
    const existingProductMap = new Map(existingProducts.map(p => [p.handle, p.id]));
    console.log(`📦 现有产品数: ${existingProducts.length}`);

    console.log('───────────────────────────────────────────────────────');

    // 处理模式选择
    const args = process.argv.slice(2);
    const testMode = args.includes('--test');
    const limit = testMode ? 3 : records.length;

    if (testMode) {
        console.log(`\n⚠️ 测试模式：仅处理前 ${limit} 条记录`);
    }

    // 处理记录
    const results = { created: [], skipped: [], failed: [] };
    const processedHandles = new Set(); // 用于本次运行去重

    for (let i = 0; i < Math.min(limit, records.length); i++) {
        const row = records[i];
        const handle = row['Handle'];

        // 跳过本次运行中已处理过的 handle (避免 CSV 中有重复行)
        if (processedHandles.has(handle)) continue;
        processedHandles.add(handle);

        try {
            const result = await processRow(row, existingProductMap);

            if (result.success) {
                if (result.reason === 'already_exists') {
                    results.skipped.push(result);
                } else {
                    results.created.push(result);
                    // 更新 map，防止后续重复创建
                    existingProductMap.set(result.handle, result.productId);
                }
            } else {
                results.failed.push(result);
            }

            // API 限流保护
            await new Promise(r => setTimeout(r, 500));
        } catch (error) {
            console.error(`   ❌ 异常: ${error.message}`);
            results.failed.push({ handle: row['Handle'], error: error.message });
        }
    }

    // 输出统计
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('   导入完成！');
    console.log('═══════════════════════════════════════════════════════');

    console.log(`\n   ✅ 创建成功: ${results.created.length}`);
    console.log(`   ⚠️ 已存在(更新元字段): ${results.skipped.length}`);
    console.log(`   ❌ 失败: ${results.failed.length}`);

    if (results.failed.length > 0) {
        console.log('\n失败详情:');
        results.failed.slice(0, 10).forEach(f => {
            console.log(`   - ${f.handle}: ${f.reason || f.error}`);
        });
        if (results.failed.length > 10) {
            console.log(`   ... 还有 ${results.failed.length - 10} 条`);
        }
    }

    // 保存结果到文件
    const resultPath = path.join(process.cwd(), 'import-result.json');
    fs.writeFileSync(resultPath, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`\n📄 详细结果已保存到: ${resultPath}`);
}

main().catch(console.error);
