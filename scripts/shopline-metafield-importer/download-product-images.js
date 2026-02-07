/**
 * 下载 Shopline 产品原图工具
 * 
 * 功能：
 * 1. 获取所有产品列表（或指定 Handle）
 * 2. 检查图片是否已经是 WebP
 * 3. 这里的逻辑是：如果需要替换，就下载原图到 temp_images 目录
 * 
 * 用法：
 * node download-product-images.js --handle=FMxxxx  (测试单品)
 * node download-product-images.js --all             (全量下载)
 */

import fs from "fs";
import path from "path";
import fetch from "node-fetch";

// 加载环境变量
const envPath = path.join(process.cwd(), ".env");
if (!fs.existsSync(envPath)) {
    console.error("❌ 未找到 .env 文件，请确保在 scripts/shopline-metafield-importer 目录下运行");
    process.exit(1);
}
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && !key.startsWith("#")) {
    env[key.trim()] = valueParts.join("=").trim();
  }
});

const CONFIG = {
  storeDomain: env.SHOPLINE_STORE_DOMAIN,
  accessToken: env.SHOPLINE_ACCESS_TOKEN,
  productVersion: "v20241201",
  // 临时图片保存路径 (相对于脚本运行目录的上级 image_tools)
  tempDir: path.join(process.cwd(), "../image_tools/temp_images"),
  mappingFile: path.join(process.cwd(), "../image_tools/image_mapping.json")
};

// 确保目录存在
if (!fs.existsSync(CONFIG.tempDir)) {
    fs.mkdirSync(CONFIG.tempDir, { recursive: true });
}

/**
 * 获取单个产品
 */
async function getProductByHandle(handle) {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.productVersion}/products/products.json?handle=${handle}`;
    const response = await fetch(url, {
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${CONFIG.accessToken}`,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    return data.products?.[0];
}

/**
 * 获取所有产品 (分页)
 */
async function getAllProducts() {
    let allProducts = [];
    let page = 1;
    let hasNext = true;
    
    console.log("正在获取产品列表...");
    
    while (hasNext) {
        const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.productVersion}/products/products.json?limit=250&page=${page}`;
        const response = await fetch(url, {
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${CONFIG.accessToken}`,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
        
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        
        const data = await response.json();
        const products = data.products || [];
        
        if (products.length === 0) {
            hasNext = false;
        } else {
            allProducts = allProducts.concat(products);
            console.log(`  已获取第 ${page} 页，共 ${products.length} 个产品`);
            page++;
            // 简单的防限流
            await new Promise(r => setTimeout(r, 200));
        }
    }
    return allProducts;
}

/**
 * 下载图片
 */
async function downloadImage(url, destPath) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            signal: controller.signal
        });
        if (!res.ok) throw new Error(`Download failed: ${res.status}`);
        const arrayBuffer = await res.arrayBuffer();
        fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
    } finally {
        clearTimeout(timeout);
    }
}

async function processProduct(product, mapping) {
    console.log(`处理产品: ${product.handle} (ID: ${product.id})`);
    
    if (!product.images || product.images.length === 0) {
        console.log("  ⚠️ 无图片，跳过");
        return;
    }

    const productDir = path.join(CONFIG.tempDir, product.handle);
    if (!fs.existsSync(productDir)) {
        fs.mkdirSync(productDir, { recursive: true });
    }

    const productMapping = {
        id: product.id,
        handle: product.handle,
        images: []
    };

    let pIndex = 1;
    for (const img of product.images) {
        // 检查是否已经是 webp
        // Shopline 图片 URL 通常包含后缀，或者我们通过 content-type 判断？
        // 这里简单判断 URL 结尾
        const cleanUrl = img.src.split('?')[0];
        const isWebP = cleanUrl.toLowerCase().endsWith(".webp"); 
        
        // 即便是 webp，如果用户想重新压缩，可能也需要下载。
        // 但根据需求，是“过大的图换成webp”，所以已经是webp的可能不需要动？
        // 为了保险，我们先下载原图。
        
        const ext = path.extname(cleanUrl) || ".jpg";
        const filename = `${product.handle}_${pIndex}${ext}`;
        const localPath = path.join(productDir, filename);
        
        console.log(`  ⬇️ 下载图片: ${filename}`);
        try {
            await downloadImage(cleanUrl, localPath);
            productMapping.images.push({
                original_id: img.id,
                original_src: cleanUrl,
                local_path: localPath,
                filename: filename
            });
        } catch (e) {
            console.error(`  ❌ 下载失败: ${e.message}`);
        }
        pIndex++;
    }
    
    // 更新 mapping
    mapping[product.handle] = productMapping;
}

async function main() {
    const args = process.argv.slice(2);
    const handleArg = args.find(a => a.startsWith("--handle="));
    const allArg = args.includes("--all");
    
    let productsToProcess = [];
    
    if (handleArg) {
        const handle = handleArg.split("=")[1];
        const product = await getProductByHandle(handle);
        if (product) productsToProcess.push(product);
        else console.error(`❌ 未找到产品 Handle: ${handle}`);
    } else if (allArg) {
        productsToProcess = await getAllProducts();
    } else {
        console.log("请指定参数: --handle=<handle> 或 --all");
        process.exit(1);
    }
    
    // 读取现有 mapping
    let mapping = {};
    if (fs.existsSync(CONFIG.mappingFile)) {
        try {
            mapping = JSON.parse(fs.readFileSync(CONFIG.mappingFile, "utf-8"));
        } catch (e) {}
    }
    
    for (const p of productsToProcess) {
        await processProduct(p, mapping);
    }
    
    // 保存 mapping
    fs.writeFileSync(CONFIG.mappingFile, JSON.stringify(mapping, null, 2));
    console.log(`\n✅ 处理完成，Mapping 已保存至 ${CONFIG.mappingFile}`);
}

main().catch(console.error);
