/**
 * Blog Metafields 诊断脚本 v2
 * 
 * 由于 Shopline Blog API 路径未知，我们使用两种方法：
 * 1. 让用户提供文章 ID，直接查询元字段
 * 2. 测试多个可能的 API 端点
 */

import fs from 'fs';
import path from 'path';

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

const CONFIG = {
    storeDomain: env.SHOPLINE_STORE_DOMAIN || 'fominte.myshopline.com',
    accessToken: env.SHOPLINE_ACCESS_TOKEN,
    apiVersion: 'v20241201'
};

console.log('═══════════════════════════════════════════');
console.log('  Blog Metafields 诊断工具 v2');
console.log('═══════════════════════════════════════════\n');

/**
 * 测试不同的 API 端点
 */
async function testApiEndpoints() {
    console.log('🔍 测试可能的 Blog API 端点...\n');

    const endpoints = [
        '/admin/openapi/v20241201/blogs.json',
        '/admin/openapi/v20241201/blogs/blogs.json',
        '/admin/openapi/v20241201/blog/blogs.json',
        '/admin/openapi/v20241201/articles.json',
        '/admin/openapi/v20241201/articles/articles.json',
        '/admin/openapi/v20241201/collections/blogs',
    ];

    for (const endpoint of endpoints) {
        const url = `https://${CONFIG.storeDomain}${endpoint}`;
        console.log(`  测试: ${endpoint}`);
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${CONFIG.accessToken}`
                }
            });

            if (response.ok) {
                console.log(`    ✅ 成功! (状态码: ${response.status})`);
                const data = await response.json();
                console.log(`    返回数据:`, JSON.stringify(data).substring(0, 200) + '...\n');
                return { endpoint, url, data };
            } else {
                console.log(`    ❌ 失败 (${response.status}): ${await response.text().then(t => t.substring(0, 100))}\n`);
            }
        } catch (error) {
            console.log(`    ❌ 错误: ${error.message}\n`);
        }
    }

    console.log('⚠️  所有端点测试失败\n');
    return null;
}

/**
 * 直接查询文章元字段（如果用户提供了文章 ID）
 */
async function getArticleMetafields(articleId) {
    console.log(`\n📄 查询文章 ID: ${articleId} 的元字段...\n`);

    // 尝试多种可能的路径
    const possiblePaths = [
        `/admin/openapi/${CONFIG.apiVersion}/articles/${articleId}/metafields.json`,
        `/admin/openapi/${CONFIG.apiVersion}/blogs/articles/${articleId}/metafields.json`,
        `/admin/openapi/${CONFIG.apiVersion}/blog/articles/${articleId}/metafields.json`,
    ];

    for (const pathPattern of possiblePaths) {
        const url = `https://${CONFIG.storeDomain}${pathPattern}`;
        console.log(`  尝试: ${pathPattern}`);
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${CONFIG.accessToken}`
                }
            });

            if (response.ok) {
                console.log(`    ✅ 成功获取元字段!\n`);
                const data = await response.json();
                return data.metafields || [];
            } else {
                const errorText = await response.text();
                console.log(`    ❌ 失败 (${response.status}): ${errorText.substring(0, 100)}\n`);
            }
        } catch (error) {
            console.log(`    ❌ 错误: ${error.message}\n`);
        }
    }

    console.log('⚠️  无法获取元字段数据\n');
    return null;
}

/**
 * 格式化显示元字段
 */
function displayMetafields(metafields) {
    if (!metafields || metafields.length === 0) {
        console.log('❌ 未找到任何元字段\n');
        return;
    }

    console.log(`✅ 找到 ${metafields.length} 个元字段:\n`);
    console.log('─'.repeat(80) + '\n');

    // 按命名空间分组
    const grouped = {};
    metafields.forEach(mf => {
        if (!grouped[mf.namespace]) {
            grouped[mf.namespace] = [];
        }
        grouped[mf.namespace].push(mf);
    });

    for (const [namespace, fields] of Object.entries(grouped)) {
        console.log(`📦 命名空间: "${namespace}" (${fields.length} 个字段)\n`);
        
        fields.forEach((mf, index) => {
            console.log(`  ${index + 1}. 🔑 ${mf.key}`);
            console.log(`     ID: ${mf.id}`);
            console.log(`     类型: ${mf.type}`);
            
            // 格式化值显示
            let displayValue = mf.value;
            if (typeof displayValue === 'string' && displayValue.length > 150) {
                displayValue = displayValue.substring(0, 150) + '... (已截断)';
            }
            console.log(`     值: ${displayValue}`);
            console.log('');
        });
        
        console.log('─'.repeat(80) + '\n');
    }
}

/**
 * 主函数
 */
async function main() {
    try {
        console.log('💡 提示: 由于 Shopline Blog API 文档不明确，我们将:\n');
        console.log('  1. 测试多个可能的 API 端点');
        console.log('  2. 如果你知道文章 ID，我们可以直接查询元字段\n');
        console.log('─'.repeat(80) + '\n');

        // 第一步：测试 API 端点
        const result = await testApiEndpoints();

        if (result) {
            console.log('\n✅ 找到可用的 API 端点!\n');
            console.log(`端点: ${result.endpoint}`);
            console.log(`完整 URL: ${result.url}\n`);
        }

        // 第二步：如果用户在环境变量或命令行提供了文章 ID，直接查询
        const articleId = process.env.TEST_ARTICLE_ID || process.argv[2];
        
        if (articleId) {
            console.log(`\n${'═'.repeat(80)}`);
            console.log(`  使用提供的文章 ID: ${articleId}`);
            console.log(`${'═'.repeat(80)}\n`);

            const metafields = await getArticleMetafields(articleId);
            
            if (metafields) {
                displayMetafields(metafields);
                
                // 检查关键字段
                console.log('\n🎯 关键检查:\n');
                const customFields = metafields.filter(mf => mf.namespace === 'custom');
                
                if (customFields.length === 0) {
                    console.log('  ❌ 未找到 "custom" 命名空间的字段！');
                    console.log('     这可能是问题所在。模板访问 article.metafields.custom.*');
                    console.log('     但实际命名空间可能不同。\n');
                } else {
                    console.log(`  ✅ 找到 ${customFields.length} 个 custom 命名空间字段`);
                    console.log('     字段列表:');
                    customFields.forEach(mf => {
                        console.log(`       - ${mf.key}`);
                    });
                    console.log('');
                }

                // 检查预期字段是否存在
                const expectedFields = [
                    'article_type', 'reading_time', 'difficulty_level', 
                    'article_intro', 'article_tldr', 'article_conclusion',
                    'how_to_steps', 'faq_items', 'use_when', 'avoid_when'
                ];

                console.log('\n📋 预期字段检查:\n');
                expectedFields.forEach(key => {
                    const exists = metafields.some(mf => mf.key === key && mf.namespace === 'custom');
                    console.log(`  ${exists ? '✅' : '❌'} ${key}`);
                });
                console.log('');
            }
        } else {
            console.log('\n💡 使用方法:\n');
            console.log('  1. 设置环境变量: SET TEST_ARTICLE_ID=你的文章ID');
            console.log('  2. 或运行: node diagnose-blog-metafields-v2.js 你的文章ID\n');
            console.log('  如何获取文章 ID:');
            console.log('    - 在 Shopline 后台打开文章编辑页面');
            console.log('    - 查看浏览器地址栏的 URL');
            console.log('    - 找到类似 /articles/123456789 的数字部分\n');
        }

    } catch (error) {
        console.error('\n❌ 诊断过程出错:');
        console.error(error.message);
        if (error.stack) {
            console.error('\n详细错误:');
            console.error(error.stack);
        }
    }
}

main().catch(console.error);
