export const CHAT_MODEL_OPTIONS = [
  {
    id: 'qwen-flash',
    label: '快速模式'
  },
  {
    id: 'qwen3.5-plus',
    label: '自动模式'
  },
  {
    id: 'qwen-turbo',
    label: '专家模式'
  }
] as const

export type ChatModelId = (typeof CHAT_MODEL_OPTIONS)[number]['id']

export const DEFAULT_CHAT_MODEL: ChatModelId = 'qwen-turbo'

const CHAT_MODEL_ID_SET = new Set<ChatModelId>(CHAT_MODEL_OPTIONS.map((model) => model.id))

export const isChatModelId = (value: string): value is ChatModelId => {
  return CHAT_MODEL_ID_SET.has(value as ChatModelId)
}

export const resolveChatModelId = (value?: string | null): ChatModelId => {
  if (!value) {
    return DEFAULT_CHAT_MODEL
  }

  return isChatModelId(value) ? value : DEFAULT_CHAT_MODEL
}
