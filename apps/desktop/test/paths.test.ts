import { describe, expect, it } from 'vitest';
import { resolveSoftwareLibraryPath, getDefaultSearchPaths } from '../src/lib/paths';

describe('Path Discovery & Smart Root Resolution', () => {
  it('returns standard Windows search paths for all three applications', () => {
    const paths = getDefaultSearchPaths('win32');
    expect(paths.propresenter.length).toBeGreaterThan(0);
    expect(paths.freeshow.length).toBeGreaterThan(0);
    expect(paths.videopsalm.length).toBeGreaterThan(0);

    // Verify expected subdirectories exist in candidate paths
    expect(paths.propresenter.some(p => p.includes('ProPresenter') && p.includes('Libraries'))).toBe(true);
    expect(paths.freeshow.some(p => p.includes('FreeShow') && p.includes('shows'))).toBe(true);
    expect(paths.videopsalm.some(p => p.includes('VideoPsalm') && p.includes('Songbooks'))).toBe(true);
  });

  it('resolves library subfolder when given software root directory', () => {
    expect(resolveSoftwareLibraryPath('C:/Users/Worship/Documents/ProPresenter', 'propresenter'))
      .toBe('C:/Users/Worship/Documents/ProPresenter/Libraries');

    expect(resolveSoftwareLibraryPath('C:/Users/Worship/Documents/ProPresenter/', 'propresenter'))
      .toBe('C:/Users/Worship/Documents/ProPresenter/Libraries');

    expect(resolveSoftwareLibraryPath('C:/Users/Worship/Documents/FreeShow', 'freeshow'))
      .toBe('C:/Users/Worship/Documents/FreeShow/shows');

    expect(resolveSoftwareLibraryPath('C:/Users/Worship/Documents/VideoPsalm', 'videopsalm'))
      .toBe('C:/Users/Worship/Documents/VideoPsalm/Songbooks');
  });

  it('keeps path as-is if user already picked the exact library subfolder', () => {
    expect(resolveSoftwareLibraryPath('C:/Worship/Custom/Libraries', 'propresenter'))
      .toBe('C:/Worship/Custom/Libraries');

    expect(resolveSoftwareLibraryPath('C:/Worship/Custom/shows', 'freeshow'))
      .toBe('C:/Worship/Custom/shows');

    expect(resolveSoftwareLibraryPath('C:/Worship/Custom/Songbooks', 'videopsalm'))
      .toBe('C:/Worship/Custom/Songbooks');
  });

  it('handles backslashes and forward slashes consistently', () => {
    expect(resolveSoftwareLibraryPath('C:\\Users\\Worship\\Documents\\ProPresenter', 'propresenter'))
      .toBe('C:/Users/Worship/Documents/ProPresenter/Libraries');
  });
});
