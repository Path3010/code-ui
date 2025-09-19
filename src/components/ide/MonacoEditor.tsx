import { useMemo } from "react";
import Editor, { OnChange } from "@monaco-editor/react";

type Props = {
  value: string;
  language?: string;
  onChange?: OnChange;
};

export function MonacoEditor({ value, language = "plaintext", onChange }: Props) {
  const options = useMemo(
    () => ({
      fontFamily: 'Consolas, "Courier New", monospace',
      fontSize: 13,
      lineHeight: 24,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      renderWhitespace: "none",
      wordWrap: "off",
      smoothScrolling: true,
      cursorSmoothCaretAnimation: "on",
      theme: "vs-dark",

      // Added: make suggestions available for all languages
      quickSuggestions: { other: true, comments: true, strings: true },
      suggestOnTriggerCharacters: true,
      tabCompletion: "on",
      wordBasedSuggestions: "allDocuments",
      suggest: { preview: true, showWords: true },
      parameterHints: { enabled: true },
      // Keep snippets helpful even without full language servers:
      snippetSuggestions: "inline",
    }),
    [],
  );

  return (
    <div className="h-full">
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        value={value}
        onChange={onChange}
        options={options as any}
        theme="vs-dark"
      />
    </div>
  );
}