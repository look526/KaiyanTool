export type VideoPromptFlags = {
  include_action: boolean
  include_dialogue: boolean
  include_camera: boolean
  include_style: boolean
}

export const DEFAULT_VIDEO_PROMPT_FLAGS: VideoPromptFlags = {
  include_action: true,
  include_dialogue: false,
  include_camera: true,
  include_style: true,
}

export function parseVideoPromptFlags(json: unknown): VideoPromptFlags {
  if (!json || typeof json !== 'object') {
    return { ...DEFAULT_VIDEO_PROMPT_FLAGS }
  }
  const o = json as Record<string, unknown>
  return {
    include_action: o.include_action !== false,
    include_dialogue: o.include_dialogue === true,
    include_camera: o.include_camera !== false,
    include_style: o.include_style !== false,
  }
}

export type VideoPromptFlagsBody = {
  include_action_in_prompt?: boolean
  include_dialogue_in_prompt?: boolean
  include_camera_in_prompt?: boolean
  include_style_in_prompt?: boolean
}

/** 合并库存 flags、请求体覆盖与旧版 sync_audio_video。 */
export function resolveVideoPromptFlags(
  stored: unknown,
  body: VideoPromptFlagsBody | undefined,
  sync_audio_video: boolean | undefined
): VideoPromptFlags {
  const base = parseVideoPromptFlags(stored)
  if (body) {
    if (typeof body.include_action_in_prompt === 'boolean') {
      base.include_action = body.include_action_in_prompt
    }
    if (typeof body.include_dialogue_in_prompt === 'boolean') {
      base.include_dialogue = body.include_dialogue_in_prompt
    }
    if (typeof body.include_camera_in_prompt === 'boolean') {
      base.include_camera = body.include_camera_in_prompt
    }
    if (typeof body.include_style_in_prompt === 'boolean') {
      base.include_style = body.include_style_in_prompt
    }
  }
  const anyNewFlag =
    body &&
    (typeof body.include_action_in_prompt === 'boolean' ||
      typeof body.include_dialogue_in_prompt === 'boolean' ||
      typeof body.include_camera_in_prompt === 'boolean' ||
      typeof body.include_style_in_prompt === 'boolean')
  if (!anyNewFlag && sync_audio_video === true) {
    base.include_dialogue = true
  }
  return base
}
