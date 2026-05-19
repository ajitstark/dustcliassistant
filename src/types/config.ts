export type AiProviderName = "openai" | "gemini";

export type DevAssistantConfig = {
  provider: AiProviderName;
  embedding: boolean;
  memory: boolean;
  realtime: boolean;
  plugins: string[];
};

