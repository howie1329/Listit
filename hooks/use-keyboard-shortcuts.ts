"use client";

import { useEffect, useCallback, useRef } from "react";

type KeyboardShortcut = {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler: () => void;
  description: string;
  /**
   * If true, the shortcut will not fire when the user is typing in an input, textarea, or contenteditable element
   * Defaults to true
   */
  skipWhenTyping?: boolean;
};

/**
 * Register global keyboard shortcuts on the window object.
 *
 * The first shortcut that matches a key and required modifiers will have its
 * default browser behavior prevented and its handler invoked. Shortcuts with
 * `skipWhenTyping` (defaults to `true`) are ignored while the user is typing in
 * inputs, textareas, or contenteditable elements.
 *
 * @param shortcuts - Array of `KeyboardShortcut` definitions. Each entry specifies
 *   the key, optional modifier requirements (`metaKey`, `ctrlKey`, `shiftKey`, `altKey`),
 *   the `handler` to run when matched, an optional `description`, and `skipWhenTyping`
 *   which defaults to `true`.
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const shortcutsRef = useRef(shortcuts);

  // Update the ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    const isTyping =
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable;

    for (const shortcut of shortcutsRef.current) {
      const skipWhenTyping = shortcut.skipWhenTyping ?? true;

      // Skip if user is typing and shortcut should be skipped
      if (skipWhenTyping && isTyping) {
        continue;
      }

      const keyMatches =
        event.key.toLowerCase() === shortcut.key.toLowerCase();
      const metaMatches = shortcut.metaKey ? event.metaKey : !event.metaKey;
      const ctrlMatches = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
      const shiftMatches = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
      const altMatches = shortcut.altKey ? event.altKey : !event.altKey;

      // Handle Cmd/Ctrl modifier (meta on Mac, ctrl on Windows/Linux)
      const cmdOrCtrl =
        shortcut.metaKey || shortcut.ctrlKey
          ? event.metaKey || event.ctrlKey
          : true;

      if (
        keyMatches &&
        (shortcut.metaKey || shortcut.ctrlKey ? cmdOrCtrl : metaMatches && ctrlMatches) &&
        shiftMatches &&
        altMatches
      ) {
        event.preventDefault();
        shortcut.handler();
        return;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
}

/**
 * Determines the platform's primary modifier key label.
 *
 * @returns `'Cmd'` on macOS, `'Ctrl'` on other platforms; defaults to `'Ctrl'` when `navigator` is unavailable.
 */
export function useModifierKey(): "Cmd" | "Ctrl" {
  if (typeof navigator === "undefined") return "Ctrl";
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  return isMac ? "Cmd" : "Ctrl";
}