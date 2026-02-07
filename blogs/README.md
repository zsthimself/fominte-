# Blogs 文件夹说明

## 目录用途

此文件夹 (`e:\Bottle1\blogs`) 用于**备份**所有通过Fominte B2B内容引擎创作的博客文章。

## 文件命名规范

格式: `YYYY-MM-DD-{url-slug}.md`

示例:

- `2026-01-27-lace-fabric-wholesale-buyers-guide.md`
- `2026-02-03-velvet-fabric-wholesale-guide.md`
- `2026-02-10-metallic-fabric-sourcing-guide.md`

**命名原则**:

- 日期使用创作完成日期,不是发布日期
- URL slug与SEO元数据文档中的推荐slug保持一致
- 全小写,单词用连字符分隔

## 文件结构

每篇博客文章包含以下配套文件(存放在artifacts目录):

```
C:\Users\Administrator\.gemini\antigravity\brain\{conversation-id}\
├── article-{N}-{name}-draft.md           # 博客初稿 ← 备份到blogs文件夹
├── article-{N}-image-prompts.md          # 图片生成prompts
├── article-{N}-seo-metadata.md           # SEO元数据(3套方案)
├── article-{N}-knowledge-extraction.md   # 知识库提取记录
└── article-{N}-delivery-summary.md       # 交付总结

备份到:
e:\Bottle1\blogs\
└── YYYY-MM-DD-{url-slug}.md              # 最终版本备份
```

## 当前文件列表

| 文件名                                           | 创作日期   | 状态   | 字数 | 主题             |
| ------------------------------------------------ | ---------- | ------ | ---- | ---------------- |
| 2026-01-27-lace-fabric-wholesale-buyers-guide.md | 2026-01-27 | ✅完成 | 3200 | 蕾丝面料采购指南 |

## 维护流程

### 新文章添加流程

1. 完成博客创作(在artifacts目录)
2. 复制初稿至`e:\Bottle1\blogs\`,重命名为`YYYY-MM-DD-{url-slug}.md`
3. 更新本README的"当前文件列表"
4. 提交git版本控制(可选)

### 文章修订流程

1. 如需修订已发布文章,在原文件基础上修改
2. 在文件头部添加修订日志:

```markdown
# 标题

**发布日期**: 2026-01-27  
**最后修订**: 2026-02-15  
**修订说明**: 更新MOQ数据、添加新客户案例
```

## 版本控制建议

如使用Git:

```bash
cd e:\Bottle1
git add blogs/2026-01-27-lace-fabric-wholesale-buyers-guide.md
git commit -m "Add: Lace Fabric Wholesale Guide (Article #1)"
```

## 与网站发布的关系

**备份顺序**:

1. 文章创作完成 → artifacts目录
2. 用户审阅通过 → 备份到blogs文件夹
3. 粘贴至网站CMS → 线上发布
4. 发布后如有修订 → 同步更新blogs备份

**重要**: blogs文件夹是"源文件库",网站是"发布渠道"。始终保持blogs文件夹版本为最新。

## 下一步计划

- [ ] Article #2: 天鹅绒面料采购指南 (预计2026-02-03)
- [ ] Article #3: 金属面料采购指南 (预计2026-02-10)
- [ ] 考虑建立Git仓库进行版本控制
- [ ] 定期备份至云存储(Google Drive/Dropbox)

---

**最后更新**: 2026-01-27  
**维护者**: Antigravity AI + 用户
