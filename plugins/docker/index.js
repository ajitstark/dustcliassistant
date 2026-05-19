export default {
  name: "docker",
  shellHints: [
    {
      whenTagsAny: ["docker"],
      commands: ["docker ps", "docker compose ps", "docker compose logs --tail=200 <service>"]
    }
  ]
};

