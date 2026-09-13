import { useEffect } from 'react';

interface KeyboardShortcutsOptions {
  onNextLead?: () => void;
  onOpenWhatsApp?: () => void;
  onCopyMessage?: () => void;
  onMarkContacted?: () => void;
  onCloseInspector?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onNextLead,
  onOpenWhatsApp,
  onCopyMessage,
  onMarkContacted,
  onCloseInspector,
  enabled = true,
}: KeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input, textarea, select, or editable element
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const tagName = target.tagName.toUpperCase();
      const isInput =
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        tagName === 'SELECT' ||
        target.isContentEditable;

      if (isInput) {
        // Only allow Escape to blur or close even inside inputs if requested
        if (e.key === 'Escape' && onCloseInspector) {
          target.blur();
          onCloseInspector();
        }
        return;
      }

      // Check key actions
      switch (e.key.toLowerCase()) {
        case 'n':
          if (onNextLead) {
            e.preventDefault();
            onNextLead();
          }
          break;
        case 'o':
          if (onOpenWhatsApp) {
            e.preventDefault();
            onOpenWhatsApp();
          }
          break;
        case 'c':
          if (onCopyMessage) {
            e.preventDefault();
            onCopyMessage();
          }
          break;
        case 'm':
          if (onMarkContacted) {
            e.preventDefault();
            onMarkContacted();
          }
          break;
        case 'escape':
          if (onCloseInspector) {
            e.preventDefault();
            onCloseInspector();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onNextLead, onOpenWhatsApp, onCopyMessage, onMarkContacted, onCloseInspector]);
}
