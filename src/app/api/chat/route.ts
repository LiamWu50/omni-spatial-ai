import { createChatErrorResponse, isDashscopeConfigError, streamChat } from '@/features/assistant/server/stream'
import type { ChatRequestBody } from '@/lib/ai/contracts'

export const maxDuration = 60

export const POST = async (req: Request) => {
  try {
    const body = (await req.json()) as ChatRequestBody
    return await streamChat(body)
  } catch (error) {
    if (isDashscopeConfigError(error)) {
      console.warn('Map assistant chat is unavailable because DASHSCOPE_API_KEY is missing.')
    } else {
      console.error('Failed to handle map assistant chat request:', error)
    }

    return createChatErrorResponse(error)
  }
}
