import type { DevAssistantConfig } from "./src/types/config.js";

const config: DevAssistantConfig = {
  provider: "openai",
  embedding: true,
  memory: true,
  realtime: true,
  plugins: ["plugins/docker/index.js", "plugins/node/index.js", "plugins/kubernetes/index.js"]
};

export default config;
