#!/usr/bin/env python3
"""
产品数据 CSV 生成器 - 为 Shopline 创建商品准备 CSV
从产品描述 Markdown 文件生成符合 create-products.js 格式的 CSV
"""

import re
import csv
import sys
from pathlib import Path


def extract_sku_and_handle(content: str, md_file: Path) -> tuple:
    """提取 SKU 和 Handle（SEO 优化：包含关键词 + SKU）"""
    # 提取 SKU
    sku_match = re.search(r'FM\d+', md_file.name)
    if not sku_match:
        sku_match = re.search(r'SKU:\*\*\s+(FM\d+)', content)
    sku = sku_match.group(0) if sku_match else md_file.stem
    
    # 提取标题用于生成 handle
    title_match = re.search(r'\*\*Primary Title:\*\*\s+(.+)', content)
    if title_match:
        title = title_match.group(1).strip()
        # 转换为 URL slug: 小写，移除特殊字符，空格变连字符
        slug = title.lower()
        slug = re.sub(r'[^\w\s-]', '', slug)  # 移除特殊字符
        slug = re.sub(r'\s+', '-', slug)       # 空格转连字符
        slug = re.sub(r'-+', '-', slug)        # 多个连字符合并
        slug = slug.strip('-')
        # 组合: 关键词-slug + SKU
        handle = f"{slug}-{sku.lower()}"
    else:
        handle = sku.lower()
    
    return sku, handle


def extract_title(content: str) -> tuple:
    """提取产品标题"""
    # 提取 Primary Title
    match = re.search(r'\*\*Primary Title:\*\*\s+(.+)', content)
    primary_title = match.group(1).strip() if match else ""
    
    # 提取 Full Title with SKU
    match = re.search(r'\*\*Full Title with SKU:\*\*\s+(.+)', content)
    full_title = match.group(1).strip() if match else ""
    
    return primary_title, full_title


def extract_summary(content: str) -> str:
    """提取产品摘要（Subtitle）"""
    match = re.search(r'###\s*1\.\s*Product Summary.*?:(.*?)(?:---|###)', content, re.DOTALL)
    if match:
        summary = match.group(1).strip()
        # 确保不超过 400 字符
        if len(summary) > 400:
            summary = summary[:397] + "..."
        return summary
    return ""


def extract_description_html(content: str) -> str:
    """
    提取产品描述 HTML - 只包含开场介绍段落
    不包含 Selling Points、Craftsmanship、OEM、Our Process 等元字段内容
    这些内容会单独写入对应的元字段中
    """
    # 只提取开头标题和介绍段落（到 Selling Points 之前）
    match = re.search(r'###\s*2\.\s*Full Description.*?:(.*?)(?=##\s+Selling Points)', content, re.DOTALL)
    if not match:
        return ""
    
    description = match.group(1).strip()
    
    # 简单的 Markdown 到 HTML 转换
    html = description
    
    # [H2] 标题转换为 strong（避免前端显示过大）
    html = re.sub(r'## (.+)', r'<p><strong>\1</strong></p>', html)
    
    # 处理段落
    lines = html.split('\n')
    result_lines = []
    
    for line in lines:
        stripped = line.strip()
        if stripped and not stripped.startswith('#'):
            result_lines.append(f'<p>{stripped}</p>')
    
    return '\n'.join(result_lines)



def extract_tags(content: str) -> str:
    """提取产品标签"""
    match = re.search(r'##\s*Recommended Product Tags.*?:(.*?)$', content, re.DOTALL)
    if match:
        tags_text = match.group(1).strip()
        # 清理并返回
        tags = [t.strip() for t in tags_text.split(',') if t.strip()]
        # 确保包含 fleece 标签
        if 'fleece' not in [t.lower() for t in tags]:
            tags.insert(0, 'fleece')
        return ', '.join(tags)
    return "fleece"  # 默认至少包含 fleece


def extract_master_image(content: str, sku: str) -> str:
    """提取主图路径"""
    # 查找 "Main Image" 指定的文件名
    match = re.search(r'\*\*Main Image:\*\*\s+(.+?\.(?:png|jpg|webp))', content, re.IGNORECASE)
    if match:
        filename = match.group(1).strip()
        # 如果是相对路径，转换为 WebP
        if not filename.startswith('http'):
            filename = filename.replace('.png', '.webp').replace('.jpg', '.webp')
        return filename
    
    # 默认使用 SKU.webp
    return f"{sku}.webp"


def parse_key_information(content: str) -> str:
    """解析 B2B Key Information Box"""
    # 方法1：尝试精确匹配
    match = re.search(r'###\s*3\.\s*B2B Key Information Box:\s*\n+(.*?)(?=\n\n---|\n\n##|\Z)', content, re.DOTALL)
    if match:
        section = match.group(1).strip()
        lines = [line.strip() for line in section.split('\n') if line.strip() and line.strip().startswith(('-', '*'))]
        if lines:
            return '\n'.join(lines)
    
    # 方法2：简化匹配
    match = re.search(r'B2B Key Information Box:(.*?)(?=\n\n)', content, re.DOTALL)
    if match:
        section = match.group(1).strip()
        lines = [line.strip() for line in section.split('\n') if line.strip() and line.strip().startswith(('-', '*'))]
        return '\n'.join(lines)
    
    return ""


def parse_selling_points(content: str) -> str:
    """解析 Selling Points"""
    match = re.search(r'##\s+Selling Points\s*\n(.*?)(?=\n##\s+Craftsmanship)', content, re.DOTALL)
    if not match:
        return ""
    
    section = match.group(1).strip()
    lines = [line.strip() for line in section.split('\n') if line.strip() and line.strip().startswith(('*', '-'))]
    return '\n'.join(lines)


def parse_craftsmanship(content: str) -> str:
    """解析 Craftsmanship & Quality"""
    match = re.search(r'##\s+Craftsmanship & Quality(.*?)(?=##\s+OEM/ODM)', content, re.DOTALL)
    if not match:
        return ""
    return match.group(1).strip()


def parse_customization(content: str) -> str:
    """解析 OEM/ODM Customization (Services)，标题可能有多种变体"""
    # 支持 'OEM/ODM Customization' 或 'OEM/ODM Customization Services'
    match = re.search(r'##\s+OEM/ODM Customization[^\n]*(.*?)(?=##\s+Our Process|---)', content, re.DOTALL)
    if not match:
        return ""
    return match.group(1).strip()


def parse_process(content: str) -> str:
    """解析 Our Process，后续可能是 Specifications、Recommended Tags 或 ---"""
    match = re.search(r'##\s+Our Process(.*?)(?=##\s+Specifications|##\s+Recommended|---|$)', content, re.DOTALL)
    if not match:
        return ""
    
    section = match.group(1).strip()
    lines = [line.strip() for line in section.split('\n') if line.strip() and re.match(r'^\d+\.', line.strip())]
    return '\n'.join(lines)


def generate_product_csv(md_files: list, output_file: Path, image_base_path: str = ""):
    """
    从多个产品描述 Markdown 文件生成 Shopline 导入 CSV
    
    Args:
        md_files: Markdown 文件路径列表
        output_file: 输出 CSV 文件路径
        image_base_path: 图片基础路径或 URL 前缀
    """
    # CSV 列定义（符合 create-products.js 的格式）
    fieldnames = [
        'Handle',
        'Title*',
        'Product description html',
        'Subtitle',
        'Tags',
        'Master image',
        'SKU',
        'SKU price',
        'SKU compare at price',
        'Vendor',
        'Custom Product Type',
        'Published',
        'SEO title',
        'SEO description',
        'my_fields.key_info',
        'my_fields.selling_points',
        'my_fields.Craftsmanship_Quality',
        'my_fields.OEM',
        'my_fields.Our_Process'
    ]
    
    rows = []
    
    for md_file in md_files:
        print(f"📖 处理: {md_file.name}")
        
        content = md_file.read_text(encoding='utf-8')
        sku, handle = extract_sku_and_handle(content, md_file)
        primary_title, full_title = extract_title(content)
        
        # 构建图片路径
        master_image = extract_master_image(content, sku)
        if image_base_path and not master_image.startswith('http'):
            master_image = f"{image_base_path}/{master_image}"
        
        row = {
            'Handle': handle,
            'Title*': primary_title,
            'Product description html': extract_description_html(content),
            'Subtitle': extract_summary(content),
            'Tags': extract_tags(content),
            'Master image': master_image,
            'SKU': sku,
            'SKU price': '0.00',  # 需要用户填写
            'SKU compare at price': '0.00',
            'Vendor': 'fominte',
            'Custom Product Type': 'Fleece Outerwear',
            'Published': 'Y',
            'SEO title': primary_title,
            'SEO description': extract_summary(content),
            'my_fields.key_info': parse_key_information(content),
            'my_fields.selling_points': parse_selling_points(content),
            'my_fields.Craftsmanship_Quality': parse_craftsmanship(content),
            'my_fields.OEM': parse_customization(content),
            'my_fields.Our_Process': parse_process(content)
        }
        
        rows.append(row)
        print(f"   ✅ {sku} - {primary_title}")
    
    # 写入 CSV
    with open(output_file, 'w', encoding='utf-8-sig', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"\n✅ 成功生成 CSV: {output_file}")
    print(f"📊 包含 {len(rows)} 个产品")


def main():
    if len(sys.argv) < 2:
        print("用法: python generate_product_csv.py <产品描述目录或文件> [输出.csv] [图片基础路径]")
        print("示例: python generate_product_csv.py ./product_listings products.csv http://example.com/images")
        sys.exit(1)
    
    input_path = Path(sys.argv[1])
    output_file = Path(sys.argv[2]) if len(sys.argv) >= 3 else Path("products_import.csv")
    image_base_path = sys.argv[3] if len(sys.argv) >= 4 else ""
    
    # 查找所有产品描述文件
    if input_path.is_dir():
        md_files = sorted(input_path.glob("FM*_product_listing.md"))
    elif input_path.is_file():
        md_files = [input_path]
    else:
        print(f"❌ 错误: 路径不存在 - {input_path}")
        sys.exit(1)
    
    if not md_files:
        print(f"❌ 错误: 未找到产品描述文件")
        sys.exit(1)
    
    print(f"\n🚀 开始生成产品 CSV...")
    print(f"📁 输入: {input_path}")
    print(f"📄 输出: {output_file}")
    print(f"🖼️  图片路径: {image_base_path or '(相对路径)'}")
    print("─" * 60)
    
    generate_product_csv(md_files, output_file, image_base_path)


if __name__ == "__main__":
    main()
