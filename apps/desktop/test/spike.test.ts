import { describe, expect, it } from 'vitest';
import {
  generateSandboxPresentation,
  generateSandboxBytes,
  writeSandboxFiles,
  type SandboxBytes,
} from '../src/lib/spike';
import { importFile } from '@skeuos-labs/mizmor';

describe('Live Compatibility Spike Generator', () => {
  it('generates a rich multi-section canonical presentation with French & Malagasy accents', () => {
    const pres = generateSandboxPresentation();
    expect(pres.title).toBe('Yachad Test Hymn');
    expect(pres.sections.length).toBeGreaterThanOrEqual(3);
    expect(pres.slides.length).toBeGreaterThanOrEqual(4);

    const allText = pres.slides.map((s) => s.items.map((i) => i.plainText).join(' ')).join(' ');
    // Verify accents and special characters
    expect(allText).toContain('Façade');
    expect(allText).toContain('Androany');
    expect(allText).toContain('Miderà');
    expect(allText).toContain("C'est");
  });

  it('generates valid binary payloads for pro, freeshow, and vpc formats', async () => {
    const files: SandboxBytes = await generateSandboxBytes();
    expect(files.proBytes.length).toBeGreaterThan(0);
    expect(files.showBytes.length).toBeGreaterThan(0);
    expect(files.vpcBytes.length).toBeGreaterThan(0);

    // Verify ProPresenter import
    const proImport = await importFile(files.proBytes, 'Yachad_Test_Hymn.pro');
    expect(proImport.ok).toBe(true);
    if (!proImport.ok) throw proImport.error;
    expect(proImport.value.presentations[0].title).toBe('Yachad Test Hymn');

    // Verify FreeShow import
    const showImport = await importFile(files.showBytes, 'Yachad_Test_Hymn.show');
    expect(showImport.ok).toBe(true);
    if (!showImport.ok) throw showImport.error;
    expect(showImport.value.presentations[0].title).toBe('Yachad Test Hymn');

    // Verify VideoPsalm import
    const vpcImport = await importFile(files.vpcBytes, 'Yachad_Test.vpc');
    expect(vpcImport.ok).toBe(true);
    if (!vpcImport.ok) throw vpcImport.error;
    expect(vpcImport.value.presentations[0].title).toBe('Yachad Test Hymn');
  });

  it('computes expected relative target file paths according to Yachad mapping contract', () => {
    // 1 VideoPsalm .vpc = 1 ProPresenter library folder = 1 FreeShow folder
    const targetPaths = writeSandboxFiles({
      proLibrariesRoot: 'D:/Documents/ProPresenter/Libraries',
      freeShowShowsRoot: 'D:/Documents/FreeShow/Shows',
      videoPsalmSongbooksRoot: 'C:/Users/Public/Documents/VideoPsalm/SongBooks',
      dryRun: true,
    });

    expect(targetPaths.proPath).toBe('D:/Documents/ProPresenter/Libraries/Yachad_Test/Yachad_Test_Hymn.pro');
    expect(targetPaths.showPath).toBe('D:/Documents/FreeShow/Shows/Yachad_Test/Yachad_Test_Hymn.show');
    expect(targetPaths.vpcPath).toBe('C:/Users/Public/Documents/VideoPsalm/SongBooks/Yachad_Test.vpc');
  });
});
