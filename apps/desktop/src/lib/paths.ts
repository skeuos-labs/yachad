export type SupportedApp = 'propresenter' | 'freeshow' | 'videopsalm';

export interface DefaultPaths {
  propresenter: string[];
  freeshow: string[];
  videopsalm: string[];
}

export interface DetectedAppPaths {
  propresenter: string | null;
  freeshow: string | null;
  videopsalm: string | null;
}

const SUBFOLDER_MAP: Record<SupportedApp, { suffix: string; subfolder: string }> = {
  propresenter: { suffix: '/libraries', subfolder: 'Libraries' },
  freeshow: { suffix: '/shows', subfolder: 'shows' },
  videopsalm: { suffix: '/songbooks', subfolder: 'Songbooks' },
};

/**
 * Returns standard search candidates for Windows, macOS, or Linux
 */
export function getDefaultSearchPaths(platform: string = typeof process !== 'undefined' ? process.platform : 'win32'): DefaultPaths {
  if (platform === 'darwin') {
    const home = '/Users/Current';
    return {
      propresenter: [
        `${home}/Documents/ProPresenter/Libraries`,
        `${home}/Library/Application Support/RenewedVision/ProPresenter/Libraries`,
      ],
      freeshow: [
        `${home}/Documents/FreeShow/shows`,
        `${home}/Library/Application Support/FreeShow/shows`,
      ],
      videopsalm: [], // VideoPsalm is Windows-only
    };
  }

  if (platform === 'linux') {
    const home = '/home/current';
    return {
      propresenter: [], // ProPresenter is Windows and macOS only
      freeshow: [
        `${home}/Documents/FreeShow/shows`,
        `${home}/.local/share/FreeShow/shows`,
      ],
      videopsalm: [], // VideoPsalm is Windows-only
    };
  }

  // Windows defaults
  const userProfile = 'C:/Users/Current';
  const publicProfile = 'C:/Users/Public';
  const appData = `${userProfile}/AppData/Roaming`;

  return {
    propresenter: [
      `${userProfile}/Documents/ProPresenter/Libraries`,
      `${appData}/RenewedVision/ProPresenter/Libraries`,
    ],
    freeshow: [
      `${userProfile}/Documents/FreeShow/shows`,
      `${appData}/FreeShow/shows`,
    ],
    videopsalm: [
      `${publicProfile}/Documents/VideoPsalm/SongBooks`,
      `${userProfile}/Documents/VideoPsalm/SongBooks`,
      `${appData}/VideoPsalm/Songbooks`,
    ],
  };
}

/**
 * Normalizes backslashes to forward slashes and trims trailing slashes.
 */
export function normalizePath(path: string): string {
  if (!path) return '';
  return path.replace(/\\/g, '/').replace(/\/+$/, '');
}

/**
 * Resolves the exact library subfolder given an application path.
 * If the user selected the software root folder (e.g. `.../ProPresenter`),
 * appends the appropriate subfolder (`Libraries`, `shows`, or `Songbooks`).
 * If the path already points to the subfolder, leaves it as-is.
 */
export function resolveSoftwareLibraryPath(selectedPath: string, app: SupportedApp): string {
  const norm = normalizePath(selectedPath);
  if (!norm) return '';

  const { suffix, subfolder } = SUBFOLDER_MAP[app];

  // Already points directly to the subfolder (case-insensitive check)
  if (norm.toLowerCase().endsWith(suffix)) {
    return norm;
  }

  // User selected software root or parent folder -> append standard subfolder
  return `${norm}/${subfolder}`;
}

/**
 * Probes the local machine via Tauri IPC to detect real installed software libraries.
 * Falls back gracefully in web preview mode.
 */
export async function detectInstalledLibraries(): Promise<DetectedAppPaths> {
  const isTauri =
    typeof window !== 'undefined' &&
    Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);

  if (isTauri) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const detected = await invoke<DetectedAppPaths>('detect_installed_libraries');
      return detected;
    } catch (err) {
      console.warn('Failed to detect installed libraries via Tauri IPC:', err);
    }
  }

  return {
    propresenter: null,
    freeshow: null,
    videopsalm: null,
  };
}
