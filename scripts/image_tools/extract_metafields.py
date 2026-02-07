#!/usr/bin/env python3
"""
产品描述提取为 Shopline 元字段 CSV
从生成的产品描述 Markdown 文件中提取关键模块，导出为可导入 Shopline 的 CSV 格式
"""

import re
import csv
import sys
from pathlib import Path


def extract_section(content: str, start_marker: str, end_marker: str = None) -> str:
    """提取指定章节的内容"""
    pattern = rf'{re.escape(start_marker)}(.*?)'
    if end_marker:
        pattern += rf'(?={re.escape(end_marker)})'
    else:
        pattern += r'$'
    
    match = re.search(pattern, content, re.DOTALL)
    if match:
        text = match.group(1).strip()
        # 移除 Markdown 标题标记
        text = re.sub(r'^#+\s+', '', text, flags=re.MULTILINE)
        return text
    return ""


def parse_key_information(content: str) -> str:
    """解析 B2B Key Information Box"""
    # 查找 "### 3. B2B Key Information Box:" 后面的内容
    match = re.search(r'###\s*3\.\s*B2B Key Information Box:(.*?)(?=---|###|##\s+Module 2)', content, re.DOTALL)
    if not match:
        return ""
    
    section = match.group(1).strip()
    # 格式化为简洁的列表
    lines = [line.strip() for line in section.split('\n') if line.strip() and line.strip().startswith('*')]
    return '\n'.join(lines)


def parse_selling_points(content: str) -> str:
    """解析 Selling Points"""
    # 查找 "## Selling Points" 后面的内容
    match = re.search(r'##\s+Selling Points(.*?)(?=##\s+Craftsmanship)', content, re.DOTALL)
    if not match:
        return ""
    
    section = match.group(1).strip()
    # 保留列表项
    lines = [line.strip() for line in section.split('\n') if line.strip() and line.strip().startswith('*')]
    return '\n'.join(lines)



def parse_craftsmanship(content: str) -> str:
    """解析 Craftsmanship & Quality"""
    section = extract_section(content, '## Craftsmanship & Quality', '## OEM/ODM Customization Services')
    return section


def parse_customization(content: str) -> str:
    """解析 OEM/ODM Customization Services"""
    match = re.search(r'##\s+OEM/ODM Customization Services(.*?)(?=##\s+Our Process)', content, re.DOTALL)
    if not match:
        return ""
    
    section = match.group(1).strip()
    return section



def parse_process(content: str) -> str:
    """解析 Our Process"""
    section = extract_section(content, '## Our Process', '## Specifications')
    if not section:
        return ""
    
    # 保留编号列表
    lines = [line.strip() for line in section.split('\n') if line.strip() and re.match(r'^\d+\.', line.strip())]
    return '\n'.join(lines)


def extract_metafields(md_file: Path) -> dict:
    """从 Markdown 文件提取所有元字段内容"""
    content = md_file.read_text(encoding='utf-8')
    
    # 提取 SKU（从文件名或内容）
    sku_match = re.search(r'FM\d+', md_file.name)
    if not sku_match:
        sku_match = re.search(r'SKU:\*\*\s+(FM\d+)', content)
    sku = sku_match.group(0) if sku_match else md_file.stem
    
    # 提取 Handle（通常是 SKU 的小写形式）
    handle = sku.lower()
    
    # 提取 Product Summary
    summary = extract_section(content, '### 1. Product Summary', '---')
    
    metafields = {
        'handle': handle,
        'sku': sku,
        'summary': summary,
        'key_information': parse_key_information(content),
        'selling_points': parse_selling_points(content),
        'craftsmanship': parse_craftsmanship(content),
        'customization': parse_customization(content),
        'process': parse_process(content)
    }
    
    return metafields


def export_to_csv(metafields: dict, output_file: Path):
    """导出为 Shopline 元字段 CSV 格式"""
    # Shopline 元字段命名规范（用户提供的正确秘钥）
    fieldnames = [
        'Handle',
        'my_fields.key_info',
        'my_fields.selling_points',
        'my_fields.Craftsmanship_Quality',
        'my_fields.OEM',
        'my_fields.Our_Process'
    ]
    
    with open(output_file, 'w', encoding='utf-8-sig', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        row = {
            'Handle': metafields['handle'],
            'my_fields.key_info': metafields['key_information'],
            'my_fields.selling_points': metafields['selling_points'],
            'my_fields.Craftsmanship_Quality': metafields['craftsmanship'],
            'my_fields.OEM': metafields['customization'],
            'my_fields.Our_Process': metafields['process']
        }
        
        writer.writerow(row)
    
    print(f"✅ 成功导出元字段到: {output_file}")
    print(f"📦 产品 Handle: {metafields['handle']}")
    print(f"📝 包含 {len([v for v in metafields.values() if v])} 个非空字段")


def main():
    if len(sys.argv) < 2:
        print("用法: python extract_metafields.py <产品描述.md> [输出.csv]")
        print("示例: python extract_metafields.py FM0301000266_product_listing.md")
        sys.exit(1)
    
    input_file = Path(sys.argv[1])
    if not input_file.exists():
        print(f"❌ 错误: 文件不存在 - {input_file}")
        sys.exit(1)
    
    # 默认输出文件名
    if len(sys.argv) >= 3:
        output_file = Path(sys.argv[2])
    else:
        output_file = input_file.with_suffix('.csv')
    
    print(f"📖 读取产品描述: {input_file}")
    metafields = extract_metafields(input_file)
    
    export_to_csv(metafields, output_file)


if __name__ == "__main__":
    main()
