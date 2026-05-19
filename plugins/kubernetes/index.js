export default {
  name: "kubernetes",
  shellHints: [
    {
      whenTagsAny: ["kubernetes"],
      commands: ["kubectl get pods -A", "kubectl describe pod <pod>", "kubectl logs <pod> --tail=200"]
    }
  ]
};

