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
