
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

const handle = "cropped-teddy-fleece-jacket-with-faux-fox-fur---fm0202000065";
const url = `https://${env.SHOPLINE_STORE_DOMAIN}/admin/openapi/v20241201/products/products.json?handle=${handle}`;
console.log(`Testing URL: ${url}`);

fetch(url, {
    headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${env.SHOPLINE_ACCESS_TOKEN}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
}).then(async res => {
    if (!res.ok) {
        console.log("Error:", res.status);
    } else {
        const data = await res.json();
        const p = data.products[0];
        console.log(`Product: ${p.title}`);
        console.log(`Images: ${p.images?.length}`);
        if(p.images) {
            p.images.forEach(img => console.log(`Src: ${img.src}`));
        }
    }
}).catch(err => console.error("Fetch Error:", err));
