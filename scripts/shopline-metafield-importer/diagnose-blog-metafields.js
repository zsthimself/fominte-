/**
 * Blog Metafields 诊断脚本
 * 
 * 功能：
 * 1. 查询指定博客的所有文章
 * 2. 获取文章的所有元字段数据
 * 3. 验证元字段的命名空间、key 和值
 * 4. 输出详细的诊断信息
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
console.log('  Blog Metafields 诊断工具');
console.log('═══════════════════════════════════════════\n');

/**
 * 获取所有 Blog 列表
 */
async function getBlogs() {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.apiVersion}/blogs.json`;
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${CONFIG.accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`获取 Blogs 失败: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    return data.blogs || [];
}

/**
 * 获取指定 Blog 的所有文章
 */
async function getBlogArticles(blogId) {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.apiVersion}/blogs/${blogId}/articles.json`;
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${CONFIG.accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`获取文章失败: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    return data.articles || [];
}

/**
 * 获取指定文章的所有元字段
 */
async function getArticleMetafields(articleId) {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.apiVersion}/articles/${articleId}/metafields.json`;
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${CONFIG.accessToken}`
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.warn(`⚠️  获取文章 ${articleId} 的元字段失败: ${response.status}`);
        return [];
    }

    const data = await response.json();
    return data.metafields || [];
}

/**
 * 格式化显示元字段值（截断过长内容）
 */
function formatMetafieldValue(value, maxLength = 100) {
    if (!value) return '(空)';
    const str = String(value);
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
}

/**
 * 主诊断流程
 */
async function main() {
    try {
        // 1. 获取所有 Blog
        console.log('📚 正在获取 Blog 列表...\n');
        const blogs = await getBlogs();
        
        if (blogs.length === 0) {
            console.log('❌ 未找到任何 Blog');
            return;
        }

        console.log(`✅ 找到 ${blogs.length} 个 Blog:\n`);
        blogs.forEach((blog, index) => {
            console.log(`  ${index + 1}. ${blog.title} (ID: ${blog.id})`);
        });
        console.log('\n' + '─'.repeat(60) + '\n');

        // 2. 遍历每个 Blog 的文章
        for (const blog of blogs) {
            console.log(`\n📖 Blog: "${blog.title}"\n`);
            
            const articles = await getBlogArticles(blog.id);
            
            if (articles.length === 0) {
                console.log('  ⚠️  此 Blog 没有文章\n');
                continue;
            }

            console.log(`  找到 ${articles.length} 篇文章:\n`);

            // 3. 检查每篇文章的元字段
            for (const article of articles) {
                console.log(`  ┌─ 文章: "${article.title}"`);
                console.log(`  │  ID: ${article.id}`);
                console.log(`  │  URL: ${article.handle}`);
                console.log(`  │`);

                // 获取元字段
                const metafields = await getArticleMetafields(article.id);

                if (metafields.length === 0) {
                    console.log(`  │  ❌ 此文章没有任何元字段！`);
                    console.log(`  └─────────────────────────────────────────\n`);
                    continue;
                }

                console.log(`  │  ✅ 找到 ${metafields.length} 个元字段:\n`);

                // 按命名空间分组
                const grouped = {};
                metafields.forEach(mf => {
                    if (!grouped[mf.namespace]) {
                        grouped[mf.namespace] = [];
                    }
                    grouped[mf.namespace].push(mf);
                });

                // 显示每个命名空间的字段
                for (const [namespace, fields] of Object.entries(grouped)) {
                    console.log(`  │  📦 命名空间: "${namespace}" (${fields.length} 个字段)\n`);
                    
                    fields.forEach(mf => {
                        console.log(`  │     🔑 ${mf.key}`);
                        console.log(`  │        类型: ${mf.type}`);
                        console.log(`  │        值: ${formatMetafieldValue(mf.value)}`);
                        console.log(`  │`);
                    });
                }

                console.log(`  └─────────────────────────────────────────\n`);
            }
        }

        // 4. 输出诊断总结
        console.log('\n' + '═'.repeat(60));
        console.log('  诊断总结');
        console.log('═'.repeat(60) + '\n');

        console.log('✅ API 查询成功，以上显示了所有文章的元字段数据\n');
        
        console.log('🎯 关键检查点:\n');
        console.log('  1. 命名空间是否为 "custom"?');
        console.log('  2. 字段 key 是否匹配模板中的访问路径?');
        console.log('  3. 字段值是否正确填充?');
        console.log('  4. 是否有文章显示"没有任何元字段"?');
        
        console.log('\n💡 如果发现问题:\n');
        console.log('  - 命名空间不是 "custom" → 需要重新创建元字段定义');
        console.log('  - 字段值为空 → 在后台编辑页面填充数据');
        console.log('  - 字段 key 不匹配 → 检查模板代码中的访问路径');
        console.log('  - 没有元字段 → 检查是否在正确的文章上创建了数据\n');

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
