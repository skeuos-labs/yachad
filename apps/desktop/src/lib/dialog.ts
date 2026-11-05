/**
 * Opens native OS directory selection dialog in Tauri, or uses browser fallback.
 */
export async function pickDirectory(options?: { title?: string }): Promise<string | null> {
  const isTauri =
    typeof window !== 'undefined' &&
    Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);

  if (isTauri) {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        directory: true,
        multiple: false,
        title: options?.title ?? 'Select Directory',
      });
      if (Array.isArray(selected)) {
        return selected[0] ?? null;
      }
      return selected;
    } catch (err) {
      console.error('Failed to open native directory picker', err);
      return null;
    }
  }

  // Fallback for browser testing / preview
  if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
    return window.prompt(options?.title ?? 'Enter folder path for testing:', 'C:/Worship/Library');
  }

  return null;
}
