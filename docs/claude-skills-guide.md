# Claude Skills Guide

## 1. 什么是 Claude Skills？

Claude Skills 是 Anthropic 为 Claude（特别是 Claude Code 代理环境）设计的一种模块化能力扩展机制。通过定义 Skills，开发者可以将特定的知识、指令、脚本和工具打包成一个可复用的单元，让 Claude 在特定场景下更高效地工作。

核心概念包括：
- **模块化**：每个 Skill 专注解决一个特定问题（如“代码审查”、“生成单元测试”、“部署应用”）。
- **标准化**：通常通过 `SKILL.md` 文件定义指令和元数据。
- **上下文感知**：Claude 可以根据任务需求按需加载 Skill，避免上下文窗口被无关信息填满。

## 2. Skill 的结构

一个标准的 Claude Skill 通常是一个包含以下内容的目录：

### 2.1 `SKILL.md` (核心)
这是 Skill 的入口文件，包含 Claude 如何使用该 Skill 的指令。

**示例结构：**
```markdown
---
name: Generate Unit Tests
description: Generates Jest unit tests for a given TypeScript file.
---

# Generate Unit Tests

## Goal
Create comprehensive unit tests for the provided component or function.

## Rules
1. Use `jest` and `react-testing-library`.
2. Cover happy paths and edge cases.
3. Mock external dependencies.

## Steps
1. Analyze the source file.
2. Identify exported functions/components.
3. Generate test cases.
```

### 2.2 辅助脚本与文件
Skill 目录中可以包含脚本（.sh, .js, .py）或模板文件，供 Claude 在执行任务时调用或参考。

### 2.3 `CLAUDE.md` (项目级上下文)
虽然不是单个 Skill，但 `CLAUDE.md` 是项目根目录下的关键文件，用于定义项目的全局规范（如代码风格、常用命令），类似于“全局 Skill”。

## 3. 官方 Skills 仓库 (`anthropics/skills`)

Anthropic 提供了一个官方的 Skills 仓库：[https://github.com/anthropics/skills](https://github.com/anthropics/skills)。

### 3.1 可以直接复制使用吗？
**可以。**
官方仓库中的 Skills 都是开源（Apache 2.0）或源码可见的。每个 Skill 都是一个独立的文件夹，包含 `SKILL.md` 和相关资源。
您可以直接将感兴趣的 Skill 文件夹（例如 `skills/pdf`）复制到您的项目目录中（如 `docs/skills/pdf`），并在对话中指示 Antigravity 使用它。

### 3.2 需要安装依赖吗？
**视具体 Skill 而定。**

*   **纯指令型 Skill**：如果 Skill 文件夹中只有 `SKILL.md`，或者只包含文本模板，则**不需要**安装任何依赖。
*   **脚本型 Skill**：如果 Skill 包含了 Python (`.py`)、JavaScript (`.js`) 或 Bash (`.sh`) 脚本，您通常需要安装相应的依赖。
    *   检查文件夹中是否有 `requirements.txt` (Python) 或 `package.json` (Node.js)。
    *   如果有，您需要在 Antigravity 的运行环境中安装这些依赖（Antigravity 通常可以直接运行标准环境命令，或者您可以指示它运行 `npm install` / `pip install`）。

**示例**：
官方的 `document-skills` (处理 PDF/DOCX) 通常包含用于解析文件的脚本，因此需要安装相应的 Python 库或 Node 包才能正常工作。

### 3.3 关于 `skills-installer`
您可能会看到类似 `npx skills-installer install ...` 的命令。这是一个第三方或社区提供的工具，用于将 Skill 自动下载到 Claude Code 的默认目录。

**在 Antigravity 中：**
*   **不建议直接使用**：因为 Antigravity 没有默认的“Skill 引擎”目录，且该工具通常针对 Claude Code 配置。
*   **替代方案**：
    1.  **手动下载**：直接从 GitHub 下载文件夹。
    2.  **Git Clone**：使用 `git clone` 下载整个仓库，然后复制需要的文件夹。
    3.  **自定义脚本**：如果您经常需要安装，我们可以编写一个简单的 Antigravity Workflow 来自动下载和配置 Skill。

## 4. 如何创建自定义 Skills

根据官方文档，您可以完全按照自己的工作流创建 Custom Skills。

### 4.1 基本步骤
1.  **创建文件夹**：为您的 Skill 创建一个独立的文件夹，名称应与 Skill 功能相关（如 `my-custom-skill`）。
2.  **创建 `SKILL.md`**：这是核心文件，必须包含 YAML Frontmatter 元数据。
3.  **添加资源（可选）**：添加脚本、模板或参考文档。

### 4.2 `SKILL.md` 模板详解
```markdown
---
name: my-skill-name
description: 清晰描述这个 Skill 做什么，以及 Claude 何时应该使用它（关键！）。
dependencies: # 可选，列出依赖
  - python>=3.8
  - pandas>=1.5.0
---

# My Skill Name

## Goal
简要说明此 Skill 的目标。

## Rules
1. 必须遵守的规则。
2. 限制条件。

## Steps
1. 第一步操作。
2. 第二步操作。
```

### 4.3 关键元数据
*   **name**: Skill 的唯一标识符（建议使用小写字母和连字符）。
*   **description**: **最关键的字段**。Claude 会根据这个描述来决定是否加载此 Skill。描述应准确说明 Skill 的功能和适用场景（例如：“当用户需要生成 pSEO 落地页内容时使用此 Skill”）。

### 4.4 在 Antigravity 中使用
创建好 Skill 文件夹后（例如放在 `docs/skills/pseo-generator/`），您就可以在对话中直接引用它：
> "请使用 `docs/skills/pseo-generator/SKILL.md` 中的规则来生成内容。"

## 5. 官方 Skills 列表 (精选)

截至 2025 年 12 月，`anthropics/skills` 仓库中包含以下主要类别的 Skills：

### 5.1 文档处理 (Document Processing)
*   **docx**: 创建、编辑和分析 Word 文档。支持修订跟踪、评论和格式保留。
*   **pdf**: PDF 工具箱。支持文本/表格提取、合并/拆分、表单处理。
*   **pptx**: 创建和分析 PowerPoint 演示文稿。
*   **xlsx**: 创建和编辑 Excel 电子表格，支持公式和数据分析。

### 5.2 创意与设计 (Creative & Design)
*   **frontend-design**: 生成高质量的前端界面代码（React/Tailwind 等）。
*   **markdown-to-epub**: 将 Markdown 文档转换为专业的 EPUB 电子书。

### 5.3 技术与开发 (Technical & Development)
*   **web-fuzzing**: 使用 `ffuf` 进行 Web 模糊测试，发现隐藏路径和 API 端点。
*   **playwright-automation**: 编写并执行 Playwright 自动化测试脚本。
*   **ios-app-building**: 构建、导航和测试 iOS 应用程序。
*   **mcp-builder**: 辅助构建 Model Context Protocol (MCP) 服务器。

### 5.4 数据分析 (Data Analysis)
*   **csv-analysis**: 自动分析 CSV 文件并生成包含可视化图表的洞察报告。
*   **vendor-spend-analysis**: 专门用于分析供应商支出数据的 Skill。

### 5.5 其他实用工具
*   **notebooklm**: 与 Google NotebookLM 交互，基于上传的文档回答问题。
*   **youtube-transcript-downloader**: 下载 YouTube 视频字幕。
*   **skill-creator**: 辅助创建新 Skill 的向导。
*   **mcp-builder**: 辅助构建 Model Context Protocol (MCP) 服务器。

### 5.6 关于 `skill-creator`
**强烈推荐使用！**
这是一个“元 Skill”，专门用来帮助您编写其他 Skill。
*   **已安装路径**：`docs/skills/skill-creator`
*   **用法**：在对话中告诉 Antigravity：“请使用 `docs/skills/skill-creator/SKILL.md` 帮我创建一个名为 [Skill名称] 的新 Skill，功能是 [描述]。”
*   它会引导您完成 `SKILL.md` 的编写，确保格式规范。

## 6. 场景化推荐 (针对您的需求)

根据您提到的两个主要场景，以下是必备的 Skills 组合推荐（已为您安装到 `docs/skills/`）：

### 场景一：B2B 外贸独立站 (Shopline) / SEO / 品牌建设
**核心目标**：内容生产、数据分析、品牌一致性。

| 推荐 Skill | 实际路径 | 用途 |
| :--- | :--- | :--- |
| **xlsx** (含 CSV) | `docs/skills/xlsx` | **必备**。用于分析 SEO 关键词表、产品导出数据、销售报表。支持 Excel 和 CSV。 |
| **frontend-design** | `docs/skills/frontend-design` | **可选**。设计 Landing Page 原型、Email 模板。 |
| **pSEO-generator** | **自定义** | **核心**。您正在构建的 pSEO 工作流。 |
| **competitor-audit** | **自定义** | 建议创建。竞品分析。 |
| **brand-guardian** | **自定义** | 建议创建。品牌调性审查。 |

### 场景二：Web 网站开发 (未来项目)
**核心目标**：代码质量、开发效率、测试自动化。

| 推荐 Skill | 实际路径 | 用途 |
| :--- | :--- | :--- |
| **frontend-design** | `docs/skills/frontend-design` | **必备**。快速生成 React/Vue 组件代码。 |
| **webapp-testing** | `docs/skills/webapp-testing` | **必备**。Playwright 自动化测试。 |
| **mcp-builder** | `docs/skills/mcp-builder` | **进阶**。构建 MCP 服务器连接外部数据。 |
| **skill-creator** | `docs/skills/skill-creator` | **必备**。辅助创建新 Skill。 |
| **tech-stack-scaffolder** | **自定义** | 建议创建。项目骨架生成。 |
| **code-reviewer** | **自定义** | 建议创建。代码审查。 |

## 7. 在 Antigravity 中应用 Skills

Antigravity 作为一个 Agentic IDE 助手，天然支持类似 Claude Skills 的工作流。我们可以通过以下方式在 Antigravity 中实现和使用 Skills：

### 3.1 映射到 Antigravity Workflows
Antigravity 原生支持 **Workflows** (`.agent/workflows/*.md`)，这与 Claude Skills 的概念高度一致。

| Claude Skill | Antigravity Workflow |
| :--- | :--- |
| 定义位置：`skills/name/SKILL.md` | 定义位置：`.agent/workflows/name.md` |
| 包含：指令、步骤 | 包含：指令、步骤、可自动执行的命令 (`// turbo`) |
| 用途：指导 Agent 完成任务 | 用途：指导 Agent 完成任务 |

**推荐做法**：
将您想要的 "Skill" 定义为 Antigravity Workflow。
例如，创建一个 `.agent/workflows/generate-pseo-page.md`，Antigravity 就可以像使用 Skill 一样遵循其中的步骤。

### 3.2 自定义 Skills 目录
如果您希望保留 Claude Skills 的原始结构（以便在其他 Claude 环境复用），可以在项目中创建 `docs/skills/` 或 `.claude/skills/` 目录。

**使用方法**：
当您需要 Antigravity 执行特定 Skill 时，只需在对话中提及：“请根据 `docs/skills/my-skill/SKILL.md` 的指引进行操作”。Antigravity 会读取该文件并遵循其中的指令。

## 8. 最佳实践建议

1.  **建立 `CLAUDE.md` (或 `AG_GUIDE.md`)**：
    在项目根目录或 `docs/` 下维护一个核心指南文件，记录项目的架构、常用命令和编码规范。Antigravity 可以随时读取此文件以“对齐”开发标准。

2.  **原子化 Skill**：
    保持每个 Skill 小而精。例如，将“发布新版本”拆分为“更新版本号”、“生成 Changelog”、“推送到 Git”等小步骤，或者整合为一个清晰的 Workflow。

3.  **利用 Antigravity 的工具能力**：
    在编写 Skill/Workflow 时，明确指示 Antigravity 使用特定工具（如 `search_web`, `run_command`）。
    *   *Claude Skill 写法*： "Run the test script."
    *   *Antigravity 优化写法*： "Run `npm test` using the `run_command` tool."

## 9. 总结

"Claude Skills" 本质上是**结构化的提示词工程 (Structured Prompt Engineering)**。在 Antigravity 中，您既可以使用原生的 Workflows 功能，也可以手动维护 Skill 文档库。

**下一步行动**：
您可以尝试将常用的开发流程（如“添加新组件”、“修复 Bug 流程”）整理为 Markdown 文件，放在 `docs/skills/` 下，并在日常开发中指示 Antigravity 使用它们。
