
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const envPath = path.join(process.cwd(), ".env");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && !key.startsWith("#")) {
    env[key.trim()] = valueParts.join("=").trim();
  }
});

const TARGET = "FM0202000065";
console.log(`Searching for product containing: ${TARGET}`);

async function searchProduct() {
    let page = 1;
    let hasNext = true;
    
    while (hasNext) {
        const url = `https://${env.SHOPLINE_STORE_DOMAIN}/admin/openapi/v20241201/products/products.json?limit=250&page=${page}`;
        process.stdout.write(`Scanning page ${page}... `);
        
        try {
            const res = await fetch(url, {
                headers: { 
                    "Content-Type": "application/json", 
                    "Authorization": `Bearer ${env.SHOPLINE_ACCESS_TOKEN}`,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });
            
            if (!res.ok) {
                console.log(`Error: ${res.status}`);
                break;
            }
            
            const data = await res.json();
            const products = data.products || [];
            
            if (products.length === 0) {
                hasNext = false;
                console.log("No more products.");
                break;
            }
            console.log(`Found ${products.length} products.`);
            
            for (const p of products) {
                let found = false;
                if (p.handle && p.handle.includes(TARGET.toLowerCase())) found = true;
                if (p.title && p.title.includes(TARGET)) found = true;
                if (p.variants) {
                    for (const v of p.variants) {
                        if (v.sku && v.sku.includes(TARGET)) found = true;
                    }
                }
                
                if (found) {
                    console.log("\n✅ MATCH FOUND!");
                    console.log(`Title: ${p.title}`);
                    console.log(`Handle: ${p.handle}`); // This is what we need
                    console.log(`ID: ${p.id}`);
                    return;
                }
            }
            
            page++;
            await new Promise(r => setTimeout(r, 200)); // Rate limit
            
        } catch (e) {
            console.error("Fetch Error:", e);
            break;
        }
    }
    console.log("\nSearch completed. Product not found.");
}

searchProduct();
