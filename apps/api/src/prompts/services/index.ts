export const NOVEL_ANALYSIS_PROMPTS = {
  systemPrompt: `你是一个专业的文学分析AI助手。你的专长是深度分析小说文本，提取：
1. 核心要素（标题、作者、类型、风格）
2. 主题分析
3. 角色详细档案
4. 场景和地点
5. 章节结构和摘要
6. 情节架构
7. 基调情感分析
8. 影视改编建议

请输出结构化的JSON格式分析结果。`,

  userPromptTemplate: `请深度分析以下小说：

**基本信息**
- 标题：{{title}}
- 作者：{{author}}
- 类型：{{genre}}
- 风格参考：{{style}}

**小说内容**
{{content}}
{{#if isTruncated}}...（内容已截断）{{/if}}

请返回JSON格式的完整分析：
{
  "title": "最终确定的标题",
  "author": "作者名",
  "genre": "类型",
  "style": "写作风格描述",
  "themes": ["主题1", "主题2", "主题3"],
  "setting": {
    "timePeriod": "时代背景",
    "locations": ["地点1", "地点2"],
    "atmosphere": "整体氛围"
  },
  "characters": [
    {
      "name": "角色名",
      "role": "protagonist/antagonist/supporting/minor",
      "description": "角色描述",
      "personality": ["性格特点1", "性格特点2"],
      "arc": "角色成长弧线",
      "relationships": [{"name": "相关角色", "type": "关系类型"}]
    }
  ],
  "chapters": [
    {
      "id": "ch_1",
      "number": 1,
      "title": "章节标题",
      "summary": "章节摘要（100字内）",
      "wordCount": 字数,
      "characters": ["出场角色"],
      "locations": ["场景地点"],
      "events": ["主要事件"],
      "tone": "本章节基调和情感",
      "keyDialogues": ["关键台词"]
    }
  ],
  "plotStructure": {
    "introduction": "开篇介绍",
    "risingAction": ["铺垫事件1", "铺垫事件2", "铺垫事件3"],
    "climax": "高潮情节",
    "fallingAction": ["收尾事件1", "收尾事件2"],
    "resolution": "结局"
  },
  "toneAnalysis": {
    "overall": "整体基调和情感",
    "breakdown": [
      {"chapter": "章节1", "tone": "章节基调"}
    ]
  },
  "suggestedAdaptationLength": 建议改编时长（分钟）
}`,

  extractChaptersPrompt: `请从以下小说文本中识别和提取章节结构：

{{content}}

请返回JSON格式的章节列表：
{
  "chapters": [
    {
      "number": 1,
      "title": "章节标题（如果原文没有则生成）",
      "summary": "本章节内容摘要（50字内）",
      "wordCount": 本章字数,
      "characters": ["本章主要角色"],
      "locations": ["本章场景"],
      "events": ["本章主要事件"],
      "tone": "本章情感基调"
    }
  ]
}`,

  identifyCharactersPrompt: `请从以下小说文本中识别和提取所有角色信息：

{{content}}

请返回JSON格式的角色列表：
{
  "characters": [
    {
      "name": "角色名",
      "role": "protagonist/antagonist/supporting/minor",
      "description": "角色描述（首次出场描述）",
      "personality": ["性格特点1", "性格特点2"],
      "arc": "角色成长弧线（如果可以推断）",
      "relationships": [{"name": "相关角色", "type": "关系描述"}]
    }
  ]
}`,

  generateScenesPrompt: `请将以下小说章节转化为场景描述：

章节 {{chapterNumber}} 内容：
{{chapterContent}}

请返回JSON格式的场景拆分：
{
  "scenes": [
    {
      "sceneNumber": 1,
      "location": "场景地点（内/外）",
      "time": "时间（日/夜/晨/昏）",
      "characters": ["出场角色"],
      "description": "场景视觉描述（适合AI生成图像）",
      "dialogue": ["本场景的关键台词"],
      "visualPrompt": "Midjourney/SD格式的视觉提示词"
    }
  ]
}`,

  adaptToScriptPrompt: `请将以下小说分析改编为剧本格式：

**小说分析**
{{novelAnalysis}}

**改编选项**
- 目标时长：{{targetLength}} 分钟
- 重点章节：{{focusChapters}}
- 改编风格：{{style}}

请返回JSON格式的剧本改编：
{
  "title": "改编后的剧本标题",
  "logline": "一句话故事概要",
  "acts": [
    {
      "number": 1,
      "title": "第一幕标题",
      "chapters": [1, 2, 3],
      "summary": "本幕概述",
      "scenes": [
        {
          "number": 1,
          "description": "场景描述",
          "dialogue": ["台词1", "台词2"],
          "visualNotes": "视觉提示"
        }
      ]
    }
  ],
  "totalScenes": 总场景数,
  "estimatedDuration": 预估时长（分钟）
}`
};

export const AI_PROCESSOR_PROMPTS = {
  systemPrompt: `你是一位专业的剧本分析专家。你的任务是解析剧本片段，提取结构化信息。

输出要求：
1. 只返回纯JSON格式，不要包含任何解释、分析过程或推理文本
2. 不要使用 reasoning_content 或其他推理字段
3. 确保字段完整性，未知字段使用null或空数组
4. 保持数据类型一致
5. 上下文信息用于理解场景连贯性

重要：响应必须直接以 "{" 开头，以 "}" 结尾，中间不能有任何其他文字。`,

  buildEnhancedPromptTemplate: `请解析以下剧本片段，提取结构化信息：

【片段信息】
片段ID: {{segmentId}}
起始行: {{startLine}}
结束行: {{endLine}}
类型: {{type}}

【上下文信息】
{{context}}

【剧本内容】
{{content}}

【角色列表】
{{characters}}

请以JSON格式返回，结构如下：
{
  "segmentId": "{{segmentId}}",
  "scenes": [
    {
      "id": "场景唯一标识",
      "number": 场景序号,
      "heading": "场景标题",
      "location": "地点",
      "time": "时间",
      "description": "场景描述",
      "characters": ["角色名列表"],
      "dialogues": [
        {
          "characterName": "角色名",
          "text": "对话内容"
        }
      ],
      "actions": [
        {
          "description": "动作描述",
          "type": "action"
        }
      ]
    }
  ],
  "characters": [
    {
      "id": "角色唯一标识",
      "name": "角色名",
      "description": "角色描述",
      "lines": 对话行数
    }
  ]
}

注意：
1. 如果片段中没有场景，scenes返回空数组[]
2. 如果片段中没有对话，dialogues返回空数组[]
3. 确保所有字符都正确转义JSON特殊字符
4. 保持与上下文的连贯性`
};

export const ASSISTANT_PROMPTS = {
  systemPrompt: `你是一个专业的AI创作助手，帮助用户在开演AI平台上进行创作。

用户当前上下文：
{{context}}

你的职责：
1. 理解用户意图，提供精准帮助
2. 基于上下文提供个性化建议
3. 推荐适合的功能和工具
4. 解决用户遇到的问题
5. 激发用户的创作灵感

回答要求：
- 简洁明了，避免冗长
- 提供可操作的建议
- 当涉及具体操作时，给出步骤
- 不确定时主动询问
- 使用中文回答`
};

export const SCRIPT_CONTROLLER_PROMPTS = {
  continueScript: {
    systemPrompt: `你是一个专业的剧本作家助手。请根据已有内容继续创作剧本，保持风格一致。`,
    userPromptTemplate: `请继续创作以下剧本：

**已有内容**
{{existingContent}}

**创作要求**
- 保持风格一致
- 自然衔接上文
- 字数约 {{wordCount}} 字

请直接输出续写内容：`
  },
  
  rewriteScript: {
    systemPrompt: `你是一个专业的剧本作家。请根据用户要求重写剧本内容。`,
    userPromptTemplate: `请重写以下剧本内容：

**原始内容**
{{originalContent}}

**重写要求**
{{requirements}}

请输出重写后的内容：`
  },
  
  optimizeScene: {
    systemPrompt: `你是一个专业的剧本场景优化专家。请优化场景描述，使其更加生动、具体。`,
    userPromptTemplate: `请优化以下场景：

**场景信息**
- 标题：{{title}}
- 描述：{{description}}
- 角色：{{characters}}

**优化方向**
{{optimizationDirection}}

请返回优化后的场景JSON：
{
  "title": "场景标题",
  "description": "优化后的场景描述",
  "atmosphere": "氛围描述",
  "visualCues": ["视觉提示1", "视觉提示2"],
  "characterActions": ["角色动作1", "角色动作2"]
}`
  },
  
  optimizeSceneContent: {
    systemPrompt: `你是一位专业的剧本优化专家。请优化场景内容，提升表达质量。`,
    userPromptTemplate: `请优化以下场景内容：

**场景内容**
{{sceneContent}}

**优化目标**
- 提升画面感
- 增强情感表达
- 优化节奏

请返回优化后的内容：`
  }
};

export const SCRIPT_PARSER_PROMPTS = {
  systemPrompt: `你是一位专业的剧本分析专家。你的任务是解析剧本内容，提取结构化信息。

输出要求：
1. 严格按照JSON格式返回
2. 确保字段完整性
3. 保持数据类型一致`,
  
  parsingPromptTemplate: `请解析以下剧本内容：

**剧本内容**
{{scriptContent}}

**解析要求**
- 识别场景标题和描述
- 提取角色对话
- 标注动作描述
- 分析场景氛围

请返回JSON格式的解析结果：
{
  "title": "剧本标题",
  "scenes": [
    {
      "id": "scene_1",
      "heading": "场景标题",
      "location": "地点",
      "time": "时间",
      "description": "场景描述",
      "characters": ["角色列表"],
      "dialogues": [
        {
          "character": "角色名",
          "line": "台词内容"
        }
      ],
      "actions": ["动作描述"]
    }
  ],
  "characters": [
    {
      "name": "角色名",
      "lineCount": 台词数量
    }
  ]
}`
};

export const CLOTHING_VARIANT_PROMPTS = {
  systemPrompt: `你是一个专业的服装设计专家。请根据角色描述生成服装变体。`,
  
  generatePromptTemplate: `请为以下角色生成服装变体：

**角色信息**
- 名字：{{characterName}}
- 描述：{{description}}
- 风格：{{style}}

请返回JSON格式的服装变体：
{
  "variants": [
    {
      "name": "服装名称",
      "description": "服装描述",
      "colors": ["颜色1", "颜色2"],
      "style": "风格",
      "visualPrompt": "AI绘图提示词"
    }
  ]
}`
};
