/** Where a keyboard shortcut landed: text entry blocks all shortcuts; a focused control keeps Space/Enter. */
export function shortcutTarget(event: KeyboardEvent): { typing: boolean; onControl: boolean } {
  const target = event.target instanceof Element ? event.target : null;
  return {
    typing: Boolean(target?.closest("input,textarea,select,[contenteditable],[inert]")),
    onControl: Boolean(target?.closest('button:not(:disabled),a,[role="button"]')),
  };
}
