'use server'

import { runSpatialAssistant, type SpatialAssistantResponse } from '@/lib/ai/spatial-agent'
import { layerDescriptorSchema } from '@/lib/gis/schema'

export interface SubmitSpatialPromptInput {
  prompt: string
  layers: unknown[]
}

export async function submitSpatialPrompt(input: SubmitSpatialPromptInput): Promise<SpatialAssistantResponse> {
  const layers = input.layers.map((layer) => layerDescriptorSchema.parse(layer))

  return runSpatialAssistant({
    prompt: input.prompt,
    layers
  })
}
