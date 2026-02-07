/**
 * 上传 Shopline 产品图片工具
 * 
 * 功能：
 * 1. 读取 image_mapping.json
 * 2. 检查本地是否有对应的 WebP 图片
 * 3. 删除线上旧图片
 * 4. 上传新的 WebP 图片
 * 
 * 用法：
 * node upload-product-images.js --handle=FMxxxx  (测试单品)
 * node upload-product-images.js --all             (全量上传)
 */

import fs from "fs";
import path from "path";
import fetch from "node-fetch";

// 加载环境变量
const envPath = path.join(process.cwd(), ".env");
if (!fs.existsSync(envPath)) {
    console.error("❌ 未找到 .env 文件");
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
  mappingFile: path.join(process.cwd(), "../image_tools/image_mapping.json")
};

/**
 * 获取产品当前的所有图片
 */
async function getProductImages(productId) {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.productVersion}/products/${productId}/images.json`;
    const response = await fetch(url, {
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${CONFIG.accessToken}`,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
    });
    if (!response.ok) throw new Error(`Fetch Images Error: ${response.status}`);
    const data = await response.json();
    return data.images || [];
}

/**
 * 删除图片
 */
async function deleteImage(productId, imageId) {
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.productVersion}/products/${productId}/images/${imageId}.json`;
    const response = await fetch(url, {
        method: "DELETE",
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${CONFIG.accessToken}`,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
    });
    return response.ok;
}

/**
 * 上传图片 (Base64)
 */
async function uploadImage(productId, localPath, alt) {
    const fileContent = fs.readFileSync(localPath, { encoding: 'base64' });
    const url = `https://${CONFIG.storeDomain}/admin/openapi/${CONFIG.productVersion}/products/${productId}/images.json`;
    
    const payload = {
        image: {
            attachment: fileContent,
            filename: path.basename(localPath),
            alt: alt || ""
        }
    };

    const response = await fetch(url, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${CONFIG.accessToken}`,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const txt = await response.text();
        throw new Error(`Upload Failed: ${txt}`);
    }
    return await response.json();
}

async function processProduct(productData) {
    try {
        console.log(`\n🚀 Starting process: ${productData.handle} (ID: ${productData.id})`);

        // 1. Verify local WebP
        const imagesToUpload = [];
        if (!productData.images || !Array.isArray(productData.images)) {
            console.error("  ❌ Missing or invalid images field");
            return;
        }

        for (const img of productData.images) {
            if (!img.local_path) {
                console.warn(`  ⚠️ Missing local_path (ID: ${img.original_id}), skipping`);
                continue;
            }
            
            console.log(`  🔍 Checking local file: ${img.local_path}`);
            
            // Original filename -> WebP filename
            const parsed = path.parse(img.local_path);
            const webpPath = path.join(parsed.dir, parsed.name + ".webp");
            
            if (!fs.existsSync(webpPath)) {
                console.error(`  ❌ WebP file not found: ${webpPath}`);
                console.error(`     Please run batch_convert_webp.py first`);
                return;
            }
            imagesToUpload.push({ path: webpPath, alt: "" }); 
        }
        
        if (imagesToUpload.length === 0) {
            console.log("  ⚠️ No images to upload");
            return;
        }

            // 2. Delete old images
    console.log("  Deleting old images... (SKIPPED FOR DEBUG)");
    /*
    const currentImages = await getProductImages(productData.id);
    for (const img of currentImages) {
        try {
            await deleteImage(productData.id, img.id);
            console.log(`     Deleted: ${img.id}`);
        } catch (e) {
            console.error(`\n  Delete failed ID ${img.id}: ${e.message}`);
        }
        await new Promise(r => setTimeout(r, 100)); // Rate limit
    }
    console.log("\n  Old images deleted.");
    */

        // 3. Upload new images
    console.log("  ⬆️  Uploading new WebP images...");
    for (const img of imagesToUpload) {
        try {
            await uploadImage(productData.id, img.path, img.alt);
            console.log(`     ✅ Upload success: ${path.basename(img.path)}`);
        } catch (e) {
            console.error(`     ❌ Upload failed: ${e.message}`);
        }
        await new Promise(r => setTimeout(r, 500)); // Rate limit
    }
    } catch (e) {
        console.error(`\n❌ processProduct 发生未捕获异常:`, e);
    }
}


async function main() {
    const args = process.argv.slice(2);
    const handleArg = args.find(a => a.startsWith("--handle="));
    const allArg = args.includes("--all");

    if (!fs.existsSync(CONFIG.mappingFile)) {
        console.error("❌ 找不到 image_mapping.json，请先运行下载脚本");
        process.exit(1);
    }

    const mapping = JSON.parse(fs.readFileSync(CONFIG.mappingFile, "utf-8"));
    const handles = Object.keys(mapping);
    
    if (handleArg) {
        const targetHandle = handleArg.split("=")[1];
        if (mapping[targetHandle]) {
            await processProduct(mapping[targetHandle]);
        } else {
            console.error(`❌ Mapping 中找不到 Handle: ${targetHandle}`);
        }
    } else if (allArg) {
        for (const handle of handles) {
            await processProduct(mapping[handle]);
        }
    } else {
        console.log("请指定参数: --handle=<handle> 或 --all");
    }
}

main().catch(console.error);
