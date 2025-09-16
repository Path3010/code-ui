class EditorEventBus extends EventTarget {}
export const eventBus = new EditorEventBus();

// Helper type-safe emitters
export function openFileInEditor(file: {
  _id: string;
  name: string;
  content: string;
  language?: string | null;
}) {
  const event = new CustomEvent("open-file", { detail: file });
  eventBus.dispatchEvent(event);
}
