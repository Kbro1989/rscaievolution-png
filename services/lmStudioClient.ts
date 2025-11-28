/**
 * LM Studio Local AI Client
 * Supports DeepSeek-R1, Flux, and VibeThinker models running on localhost
 */

export interface LMStudioConfig {
    baseUrl: string;
    textModel: string; // DeepSeek-R1
    imageModel: string; // Flux
    thinkingModel: string; // VibeThinker
}

export interface LMStudioTextRequest {
    model: string;
    messages: Array<{ role: string; content: string }>;
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
}

export interface LMStudioImageRequest {
    model: string;
    prompt: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    steps?: number;
}

export class LMStudioClient {
    private config: LMStudioConfig;

    constructor(config?: Partial<LMStudioConfig>) {
        this.config = {
            baseUrl: config?.baseUrl || 'http://172.20.128.1:1234/v1',
            textModel: config?.textModel || 'deepseek/deepseek-r1-0528-qwen3-8b',
            imageModel: config?.imageModel || 'StableDiffusionVN/Flux-Q4_K_S',
            thinkingModel: config?.thinkingModel || 'mradermacher/VibeThinker-1.5B-GGUF-Q8_0',
        };
    }

    /**
     * Generate text using DeepSeek-R1
     */
    async generateText(
        prompt: string,
        options?: { temperature?: number; maxTokens?: number; systemPrompt?: string }
    ): Promise<string> {
        const messages: Array<{ role: string; content: string }> = [];

        if (options?.systemPrompt) {
            messages.push({ role: 'system', content: options.systemPrompt });
        }

        messages.push({ role: 'user', content: prompt });

        const request: LMStudioTextRequest = {
            model: this.config.textModel,
            messages,
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.maxTokens ?? 1024,
            stream: false,
        };

        try {
            // Add timeout to prevent blocking when LM Studio is slow/unreachable
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('LM Studio timeout (3s)')), 3000)
            );

            const fetchPromise = fetch(`${this.config.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            const response = await Promise.race([fetchPromise, timeoutPromise]);

            if (!response.ok) {
                throw new Error(`LM Studio API error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices?.[0]?.message?.content || '';
        } catch (error) {
            console.error('LM Studio text generation failed:', error);
            throw error;
        }
    }

    /**
     * Generate reasoning/thinking response using VibeThinker
     */
    async generateThinking(
        prompt: string,
        options?: { temperature?: number; maxTokens?: number }
    ): Promise<{ thinking: string; response: string }> {
        const request: LMStudioTextRequest = {
            model: this.config.thinkingModel,
            messages: [
                { role: 'system', content: 'You are a helpful AI that thinks step-by-step before responding.' },
                { role: 'user', content: prompt },
            ],
            temperature: options?.temperature ?? 0.5,
            max_tokens: options?.maxTokens ?? 2048,
            stream: false,
        };

        try {
            const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error(`LM Studio API error: ${response.statusText}`);
            }

            const data = await response.json();
            const fullResponse = data.choices?.[0]?.message?.content || '';

            // VibeThinker typically outputs [Thinking: ...] followed by the actual response
            const thinkingMatch = fullResponse.match(/\[Thinking:([^\]]+)\]/);
            const thinking = thinkingMatch ? thinkingMatch[1].trim() : '';
            const responseText = fullResponse.replace(/\[Thinking:[^\]]+\]/, '').trim();

            return {
                thinking,
                response: responseText || fullResponse,
            };
        } catch (error) {
            console.error('LM Studio thinking generation failed:', error);
            throw error;
        }
    }

    /**
     * Generate image using Flux
     */
    async generateImage(
        prompt: string,
        options?: {
            negativePrompt?: string;
            width?: number;
            height?: number;
            steps?: number;
        }
    ): Promise<string> {
        const request: LMStudioImageRequest = {
            model: this.config.imageModel,
            prompt,
            negative_prompt: options?.negativePrompt,
            width: options?.width ?? 512,
            height: options?.height ?? 512,
            steps: options?.steps ?? 20,
        };

        try {
            const response = await fetch(`${this.config.baseUrl}/images/generations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error(`LM Studio API error: ${response.statusText}`);
            }

            const data = await response.json();
            // Return base64 image data or URL
            return data.data?.[0]?.url || data.data?.[0]?.b64_json || '';
        } catch (error) {
            console.error('LM Studio image generation failed:', error);
            throw error;
        }
    }

    /**
     * Check if LM Studio is available
     */
    async checkHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${this.config.baseUrl}/models`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.ok;
        } catch (error) {
            console.error('LM Studio health check failed:', error);
            return false;
        }
    }

    /**
     * List available models
     */
    async listModels(): Promise<string[]> {
        try {
            const response = await fetch(`${this.config.baseUrl}/models`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`LM Studio API error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.data?.map((model: any) => model.id) || [];
        } catch (error) {
            console.error('LM Studio model listing failed:', error);
            return [];
        }
    }
}

// Singleton instance
export const lmStudioClient = new LMStudioClient();
