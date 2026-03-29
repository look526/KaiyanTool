/**
 * 剧本解析 V1：分段提示中的体裁说明（与 AI_PROCESSOR buildEnhancedPromptTemplate 配合）。
 * script_kind 由请求体传入，缺省为 standard。
 */
export const SCRIPT_PARSE_V1_KIND_GUIDANCE: Record<string, string> = {
  standard:
    '按中式场次习惯解析：识别「场景N」「[场景N]」、内景/外景与「角色：」对白；动作与舞台说明写入 actions。',
  film:
    '偏美式剧本：关注 INT./EXT.、slug line、人物名大写对白块、括号内舞台指示；场次边界以 slug line 为主。',
  screenplay_cn:
    '兼容中式标头与美式混排；优先保留对白归属与动作顺序，避免合并不同场次。',
}

export function getScriptKindGuidance(scriptKind: string): string {
  const k = scriptKind.trim() || 'standard'
  return SCRIPT_PARSE_V1_KIND_GUIDANCE[k] ?? SCRIPT_PARSE_V1_KIND_GUIDANCE.standard
}
