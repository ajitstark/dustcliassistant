export type ShellHint = {
  whenTagsAny?: string[];
  whenMessageIncludes?: string[];
  commands: string[];
  notes?: string;
};

export type DevAssistantPlugin = {
  name: string;
  shellHints: ShellHint[];
};

