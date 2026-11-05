export type SupportedApp = 'propresenter' | 'freeshow' | 'videopsalm';

export interface DefaultPaths {
  propresenter: string[];
  freeshow: string[];
  videopsalm: string[];
}

const SUBFOLDER_MAP: Record<SupportedApp, { suffix: string; subfolder: string }> = {
  propresenter: { suffix: '/libraries', subfolder: 'Libraries' },
  freeshow: { suffix: '/shows', subfolder: 'shows' },
  videopsalm: { suffix: '/songbooks', subfolder: 'Songbooks' },
};

/**
 * Returns standard search candidates for Windows or macOS
 */
export function getDefaultSearchPaths(platform: string = typeof process !== 'undefined' ? process.platform : 'win32'): DefaultPaths {
  const isWindows = platform === 'win32';
  const userProfile = isWindows ? 'C:/Users/Current' : '/Users/Current';
  const publicProfile = isWindows ? 'C:/Users/Public' : '/Users/Shared';
  const appData = isWindows ? `${userProfile}/AppData/Roaming` : `${userProfile}/Library/Application Support`;

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
      `${userProfile}/Documents/VideoPsalm/Songbooks`,
      `${publicProfile}/Documents/VideoPsalm/Songbooks`,
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
