#!/usr/bin/env python3
"""
批量图片转换工具 - 将 PNG/JPG 图片转换为压缩的 WebP 格式

使用方法:
    python batch_convert_webp.py <目标目录>
    python batch_convert_webp.py <目标目录> --quality 80
    python batch_convert_webp.py <目标目录> --delete-original

功能:
    - 支持 PNG 和 JPG/JPEG 格式
    - 使用 ffmpeg 进行高质量压缩
    - 可自定义压缩质量 (0-100)
    - 可选择是否删除原文件
    - 显示压缩前后的文件大小对比
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path


def get_file_size_mb(filepath: Path) -> float:
    """获取文件大小（MB）"""
    return filepath.stat().st_size / (1024 * 1024)


def convert_to_webp(input_path: Path, output_path: Path, quality: int = 75) -> bool:
    """
    使用 ffmpeg 将图片转换为 WebP 格式
    
    Args:
        input_path: 输入图片路径
        output_path: 输出 WebP 路径
        quality: 压缩质量 (0-100)
    
    Returns:
        bool: 转换是否成功
    """
    cmd = [
        "ffmpeg",
        "-i", str(input_path),
        "-c:v", "libwebp",
        "-quality", str(quality),
        "-y",  # 覆盖已存在的文件
        str(output_path)
    ]
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True
        )
        return True
    except subprocess.CalledProcessError as e:
        print(f"  ❌ 转换失败: {e.stderr}")
        return False


def batch_convert(
    directory: Path,
    quality: int = 75,
    delete_original: bool = False,
    recursive: bool = False
) -> dict:
    """
    批量转换目录中的图片
    
    Args:
        directory: 目标目录
        quality: 压缩质量
        delete_original: 是否删除原文件
        recursive: 是否递归处理子目录
    
    Returns:
        dict: 转换统计信息
    """
    stats = {
        "total": 0,
        "success": 0,
        "failed": 0,
        "skipped": 0,
        "original_size_mb": 0.0,
        "converted_size_mb": 0.0
    }
    
    # 支持的图片格式
    extensions = {".png", ".jpg", ".jpeg"}
    
    # 获取所有图片文件
    if recursive:
        files = [f for f in directory.rglob("*") if f.suffix.lower() in extensions]
    else:
        files = [f for f in directory.iterdir() if f.is_file() and f.suffix.lower() in extensions]
    
    if not files:
        print(f"⚠️  在 {directory} 中未找到 PNG/JPG 图片")
        return stats
    
    print(f"\n📁 目标目录: {directory}")
    print(f"📷 发现 {len(files)} 个图片文件")
    print(f"⚙️  压缩质量: {quality}")
    print(f"🗑️  删除原文件: {'是' if delete_original else '否'}")
    print("-" * 60)
    
    for i, input_path in enumerate(files, 1):
        stats["total"] += 1
        
        # 生成输出路径
        output_path = input_path.with_suffix(".webp")
        
        # 如果 WebP 已存在，跳过
        if output_path.exists():
            print(f"[{i}/{len(files)}] ⏭️  跳过 (已存在): {input_path.name}")
            stats["skipped"] += 1
            continue
        
        original_size = get_file_size_mb(input_path)
        stats["original_size_mb"] += original_size
        
        print(f"[{i}/{len(files)}] 🔄 转换中: {input_path.name} ({original_size:.2f} MB)")
        
        if convert_to_webp(input_path, output_path, quality):
            converted_size = get_file_size_mb(output_path)
            stats["converted_size_mb"] += converted_size
            stats["success"] += 1
            
            reduction = ((original_size - converted_size) / original_size) * 100
            print(f"         ✅ 完成: {output_path.name} ({converted_size:.2f} MB, 减少 {reduction:.1f}%)")
            
            if delete_original:
                input_path.unlink()
                print(f"         🗑️  已删除原文件")
        else:
            stats["failed"] += 1
    
    return stats


def print_summary(stats: dict):
    """打印转换汇总"""
    print("\n" + "=" * 60)
    print("📊 转换汇总")
    print("=" * 60)
    print(f"  总计文件: {stats['total']}")
    print(f"  成功转换: {stats['success']}")
    print(f"  转换失败: {stats['failed']}")
    print(f"  已跳过:   {stats['skipped']}")
    
    if stats['success'] > 0:
        print(f"\n  原始大小: {stats['original_size_mb']:.2f} MB")
        print(f"  转换后:   {stats['converted_size_mb']:.2f} MB")
        saved = stats['original_size_mb'] - stats['converted_size_mb']
        if stats['original_size_mb'] > 0:
            percent = (saved / stats['original_size_mb']) * 100
            print(f"  节省空间: {saved:.2f} MB ({percent:.1f}%)")
    print("=" * 60)


def main():
    parser = argparse.ArgumentParser(
        description="批量将 PNG/JPG 图片转换为压缩的 WebP 格式",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python batch_convert_webp.py ./images
  python batch_convert_webp.py ./images --quality 80
  python batch_convert_webp.py ./images --delete-original
  python batch_convert_webp.py ./images -r  # 递归处理子目录
        """
    )
    
    parser.add_argument(
        "directory",
        type=str,
        help="包含图片的目标目录"
    )
    
    parser.add_argument(
        "-q", "--quality",
        type=int,
        default=75,
        help="WebP 压缩质量 (0-100, 默认: 75)"
    )
    
    parser.add_argument(
        "-d", "--delete-original",
        action="store_true",
        help="转换成功后删除原始图片"
    )
    
    parser.add_argument(
        "-r", "--recursive",
        action="store_true",
        help="递归处理子目录中的图片"
    )
    
    args = parser.parse_args()
    
    # 验证目录
    directory = Path(args.directory).resolve()
    if not directory.exists():
        print(f"❌ 错误: 目录不存在 - {directory}")
        sys.exit(1)
    
    if not directory.is_dir():
        print(f"❌ 错误: 路径不是目录 - {directory}")
        sys.exit(1)
    
    # 验证质量参数
    if not 0 <= args.quality <= 100:
        print(f"❌ 错误: 质量参数必须在 0-100 之间")
        sys.exit(1)
    
    # 执行批量转换
    print("\n🚀 开始批量图片转换...")
    stats = batch_convert(
        directory,
        quality=args.quality,
        delete_original=args.delete_original,
        recursive=args.recursive
    )
    
    print_summary(stats)


if __name__ == "__main__":
    main()
