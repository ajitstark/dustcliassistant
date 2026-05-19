export default {
  name: "node",
  shellHints: [
    {
      whenTagsAny: ["node"],
      commands: ["node -v", "pnpm -v", "node --trace-warnings <entry>"]
    }
  ]
};

