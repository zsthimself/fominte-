/**
 * Blog Metafields 诊断脚本 v3 (使用正确的 API 端点)
 * 
 * 根据 Shopline 官方文档更新:
 * https://developer.shopline.com/zh-hans-cn/docs/admin-rest-api/online-store/blog-post/
 * 
 * Blog API 正确路径：
 * /admin/openapi/{version}/store/blogs/{blog_collection_id}/articles.json
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
    apiVersion: 'v20241201' // 使用稳定版本
};

console.log('═══════════════════════════════════════════');
console.log('  Blog Metafields 诊断工具 v3');
console.log('═══════════════════════════════════════════\n');
console.log('基于 Shopline 官方文档：');
console.log('https://developer.shopline.com/zh-hans-cn/docs/admin-rest-api/online-store/blog-post/\n');

/**
 * 获取 Blog Collections (blogs)
 */
async function getBlogCollections() {
    // 尝试获取 blog collections 列表
    const possiblePaths = [
        `/admin/openapi/${CONFIG.apiVersion}/store/blogs.json`,
        `/admin/openapi/${CONFIG.apiVersion}/store/blog/collections.json`,
        `/admin/openapi/${CONFIG.apiVersion}/blogs.json`,
    ];

    for (const path of possiblePaths) {
        const url = `https://${CONFIG.storeDomain}${path}`;
        console.log(`尝试获取 Blog Collections: ${path}`);
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${CONFIG.accessToken}`,
                    'Content-Type': 'application/json; charset=utf-8'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ 成功! 找到 Blog Collections API\n`);
                return data;
            } else {
                console.log(`  ❌ ${response.status}: ${await response.text().then(t => t.substring(0, 100))}`);
            }
        } catch (error) {
            console.log(`  ❌ 错误: ${error.message}`);
        }
    }

    console.log('\n⚠️  无法自动获取 Blog Collections');
    console.log('请手动提供 blog_collection_id\n');
    return null;
}

/**
 * 获取指定 Blog Collection 的文章列表
 */
async function getArticles(blogCollectionId) {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.apiVersion}/store/blogs/${blogCollectionId}/articles.json`;
    
    console.log(`\n📖 获取文章列表...`);
    console.log(`URL: ${url}\n`);
    
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${CONFIG.accessToken}`,
                'Content-Type': 'application/json; charset=utf-8'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return data.blogs || data.articles || [];
        
    } catch (error) {
        throw new Error(`获取文章失败: ${error.message}`);
    }
}

/**
 * 获取单篇文章的元字段
 */
async function getArticleMetafields(blogCollectionId, articleId) {
    // 尝试多种可能的元字段 API 路径
    const possiblePaths = [
        `/admin/openapi/${CONFIG.apiVersion}/store/blogs/${blogCollectionId}/articles/${articleId}/metafields.json`,
        `/admin/openapi/${CONFIG.apiVersion}/articles/${articleId}/metafields.json`,
        `/admin/openapi/${CONFIG.apiVersion}/store/articles/${articleId}/metafields.json`,
    ];

    console.log(`\n🔍 获取文章 ${articleId} 的元字段...`);

    for (const path of possiblePaths) {
        const url = `https://${CONFIG.storeDomain}${path}`;
        console.log(`  尝试: ${path}`);
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${CONFIG.accessToken}`,
                    'Content-Type': 'application/json; charset=utf-8'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`    ✅ 成功!\n`);
                return data.metafields || [];
            } else {
                console.log(`    ❌ ${response.status}`);
            }
        } catch (error) {
            console.log(`    ❌ 错误: ${error.message}`);
        }
    }

    console.log(`  ⚠️  无法获取元字段\n`);
    return [];
}

/**
 * 格式化显示元字段
 */
function displayMetafields(metafields, articleTitle) {
    console.log(`\n${'═'.repeat(80)}`);
    console.log(`  文章: "${articleTitle}"`);
    console.log(`${'═'.repeat(80)}\n`);

    if (!metafields || metafields.length === 0) {
        console.log('❌ 此文章没有元字段数据\n');
        return;
    }

    console.log(`✅ 找到 ${metafields.length} 个元字段:\n`);

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
            console.log(`     类型: ${mf.type}`);
            
            // 格式化值显示
            let displayValue = mf.value;
            if (typeof displayValue === 'string' && displayValue.length > 100) {
                displayValue = displayValue.substring(0, 100) + '... (已截断)';
            }
            console.log(`     值: ${displayValue}`);
            console.log('');
        });
        
        console.log('─'.repeat(80) + '\n');
    }

    // 关键检查
    console.log('🎯 关键检查:\n');
    const customFields = metafields.filter(mf => mf.namespace === 'custom');
    
    if (customFields.length === 0) {
        console.log('  ❌ 未找到 "custom" 命名空间的字段！');
        console.log('     问题: 模板访问 article.metafields.custom.*');
        console.log('     但实际命名空间不同。\n');
        
        // 显示实际存在的命名空间
        const namespaces = [...new Set(metafields.map(mf => mf.namespace))];
        console.log(`  实际命名空间: ${namespaces.join(', ')}\n`);
    } else {
        console.log(`  ✅ 找到 ${customFields.length} 个 custom 命名空间字段`);
        console.log('     字段列表:');
        customFields.forEach(mf => {
            console.log(`       - ${mf.key}`);
        });
        console.log('');
    }
}

/**
 * 主函数
 */
async function main() {
    try {
        // 从命令行参数或环境变量获取 blog_collection_id
        const blogCollectionId = process.argv[2] || process.env.BLOG_COLLECTION_ID;

        if (!blogCollectionId) {
            console.log('⚠️  未提供 blog_collection_id\n');
            console.log('使用方法:');
            console.log('  1. node diagnose-blog-metafields-v3.js <blog_collection_id>');
            console.log('  2. 或设置环境变量: SET BLOG_COLLECTION_ID=你的集合ID\n');
            console.log('如何获取 blog_collection_id:');
            console.log('  - 在 Shopline 后台进入"在线商店 → 博客文章"');
            console.log('  - 点击某个博客集合');
            console.log('  - 查看浏览器地址栏 URL 中的 ID\n');
            
            // 尝试自动获取
            console.log('正在尝试自动获取 Blog Collections...\n');
            const collections = await getBlogCollections();
            if (collections) {
                console.log('找到的集合:', collections);
            }
            return;
        }

        console.log(`📚 Blog Collection ID: ${blogCollectionId}\n`);
        console.log('─'.repeat(80) + '\n');

        // 获取文章列表
        const articles = await getArticles(blogCollectionId);
        
        if (!articles || articles.length === 0) {
            console.log('❌ 此 Blog Collection 没有文章\n');
            return;
        }

        console.log(`✅ 找到 ${articles.length} 篇文章\n`);

        // 遍历每篇文章，获取元字段
        for (const article of articles) {
            const metafields = await getArticleMetafields(blogCollectionId, article.id);
            displayMetafields(metafields, article.title);
        }

        console.log('\n═'.repeat(80));
        console.log('  诊断完成');
        console.log('═'.repeat(80) + '\n');

    } catch (error) {
        console.error('\n❌ 诊断失败:');
        console.error(error.message);
        if (error.stack) {
            console.error('\n详细错误:');
            console.error(error.stack);
        }
    }
}

main().catch(console.error);
