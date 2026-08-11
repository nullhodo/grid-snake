import { useEffect } from "react";

interface Handlers {
  onRegeneratePaths: () => void;
  onRandomizeAll: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

/**
 * Custom hook to register global keyboard shortcuts (R, Space, U, Redo).
 */
export function useKeyboardShortcuts({
  onRegeneratePaths,
  onRandomizeAll,
  onUndo,
  onRedo,
}: Handlers): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when typing inside input elements
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "SELECT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "r" || e.key === "R") {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          onRegeneratePaths();
        }
      } else if (e.key === " ") {
        e.preventDefault();
        onRandomizeAll();
      } else if (e.key === "u" || e.key === "U") {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          onUndo();
        }
      } else if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" || e.key === "Z") {
          if (e.shiftKey) {
            e.preventDefault();
            onRedo();
          } else {
            e.preventDefault();
            onUndo();
          }
        } else if (e.key === "y" || e.key === "Y") {
          e.preventDefault();
          onRedo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onRegeneratePaths, onRandomizeAll, onUndo, onRedo]);
}
