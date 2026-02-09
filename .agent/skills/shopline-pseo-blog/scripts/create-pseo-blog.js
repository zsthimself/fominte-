/**
 * Shopline pSEO Blog Creator
 * 
 * 通过 Shopline Admin REST API 创建博客文章并填充元字段
 * 
 * 使用方法：
 * 1. 配置 .env 文件
 * 2. 准备博客数据 JSON 文件
 * 3. 运行：node create-pseo-blog.js ./path/to/blog-data.json
 */

require('dotenv').config();

const STORE_DOMAIN = process.env.SHOPLINE_STORE_DOMAIN || 'fominte.myshopline.com';
const ACCESS_TOKEN = process.env.SHOPLINE_ACCESS_TOKEN;
const API_VERSION = 'v20251201';

// 博客集合 ID（在 Shopline 后台获取）
const BLOG_COLLECTION_ID = process.env.SHOPLINE_BLOG_COLLECTION_ID || 'YOUR_BLOG_COLLECTION_ID';

/**
 * 发送 API 请求
 */
async function apiRequest(endpoint, method = 'GET', body = null) {
  const url = `https://${STORE_DOMAIN}/admin/openapi/${API_VERSION}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json; charset=utf-8'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${JSON.stringify(data)}`);
  }
  
  return data;
}

/**
 * 创建博客文章
 */
async function createBlogArticle(articleData) {
  console.log('📝 Creating blog article...');
  
  const endpoint = `/store/blogs/${BLOG_COLLECTION_ID}/articles.json`;
  
  const result = await apiRequest(endpoint, 'POST', {
    blog: {
      title: articleData.title,
      handle: articleData.handle,
      content_html: articleData.content_html || '<p></p>',
      digest: articleData.digest || '',
      author: articleData.author || 'Stephen Chen',
      published: articleData.published !== false,
      template_name: articleData.template_name || 'templates/blogs/detail.json'
    }
  });
  
  console.log(`✅ Article created: ${result.blog.id}`);
  return result.blog;
}

/**
 * 填充单个元字段
 */
async function setMetafield(articleId, namespace, key, value, type = 'single_line_text_field') {
  const endpoint = `/store/blogs/${BLOG_COLLECTION_ID}/articles/${articleId}/metafields.json`;
  
  // 多行文本类型
  if (value && value.includes('\n') || value.length > 255) {
    type = 'multi_line_text_field';
  }
  
  const result = await apiRequest(endpoint, 'POST', {
    metafield: {
      namespace,
      key,
      value,
      type
    }
  });
  
  return result;
}

/**
 * 批量填充元字段
 */
async function setAllMetafields(articleId, metafields) {
  console.log('📦 Setting metafields...');
  
  const results = [];
  
  for (const [key, value] of Object.entries(metafields)) {
    if (value && value.trim()) {
      try {
        console.log(`  → Setting ${key}...`);
        const result = await setMetafield(articleId, 'custom', key, value);
        results.push({ key, success: true });
        
        // 避免 API 限流
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`  ❌ Failed to set ${key}: ${error.message}`);
        results.push({ key, success: false, error: error.message });
      }
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(`✅ Metafields set: ${successCount}/${results.length}`);
  
  return results;
}

/**
 * 主函数：创建 pSEO 博客
 */
async function createPseoBlog(blogData) {
  console.log('\n========================================');
  console.log('🚀 Creating pSEO Blog Article');
  console.log('========================================\n');
  
  try {
    // 1. 创建博客文章
    const article = await createBlogArticle(blogData.blog_article);
    
    // 2. 填充元字段
    if (blogData.metafields) {
      await setAllMetafields(article.id, blogData.metafields);
    }
    
    console.log('\n========================================');
    console.log('✅ Blog created successfully!');
    console.log(`📎 Article ID: ${article.id}`);
    console.log(`🔗 URL: https://${STORE_DOMAIN}/blogs/${article.handle}`);
    console.log('========================================\n');
    
    return article;
  } catch (error) {
    console.error('\n❌ Failed to create blog:', error.message);
    throw error;
  }
}

/**
 * CLI 入口
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node create-pseo-blog.js <blog-data.json>');
    console.log('\nExample:');
    console.log('  node create-pseo-blog.js ../examples/example-blog-data.json');
    process.exit(1);
  }
  
  const fs = require('fs');
  const path = require('path');
  
  const dataPath = path.resolve(args[0]);
  
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ File not found: ${dataPath}`);
    process.exit(1);
  }
  
  const blogData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  
  // 覆盖配置
  if (blogData.api_config) {
    if (blogData.api_config.blog_collection_id) {
      global.BLOG_COLLECTION_ID = blogData.api_config.blog_collection_id;
    }
  }
  
  await createPseoBlog(blogData);
}

// 导出函数（供其他脚本调用）
module.exports = {
  createPseoBlog,
  createBlogArticle,
  setMetafield,
  setAllMetafields
};

// 直接运行时执行 main
if (require.main === module) {
  main().catch(console.error);
}
