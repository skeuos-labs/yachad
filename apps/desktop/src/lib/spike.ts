import {
  exportPresentation,
  exportLibrary,
  type Presentation,
} from '@skeuos-labs/mizmor';
import { normalizePath } from './paths';

export interface SandboxBytes {
  proBytes: Uint8Array;
  showBytes: Uint8Array;
  vpcBytes: Uint8Array;
}

export interface WriteSandboxOptions {
  proLibrariesRoot?: string;
  freeShowShowsRoot?: string;
  videoPsalmSongbooksRoot?: string;
  dryRun?: boolean;
}

export interface SandboxPathsResult {
  proPath?: string;
  showPath?: string;
  vpcPath?: string;
  written?: boolean;
  error?: string;
}

/**
 * Creates a rich canonical presentation specifically designed to test:
 * - Slide breaks and multi-line lyrics
 * - Sections (Verse, Chorus, Bridge)
 * - Multilingual accents: French (Façade, lumière, C'est) and Malagasy (Androany, Miderà)
 * - Metadata (Author, CCLI, Copyright)
 */
export function generateSandboxPresentation(): Presentation {
  return {
    id: 'yachad-test-hymn-01',
    title: 'Yachad Test Hymn',
    sourceFormat: 'unknown',
    metadata: {
      author: 'Skeuos Labs & John Newton',
      ccli: '7777777',
      copyright: 'Public Domain / CC0',
      notes: 'Yachad live application compatibility test presentation',
    },
    sections: [
      {
        id: 'sec-v1',
        name: 'Verse 1',
        slideIds: ['slide-v1'],
      },
      {
        id: 'sec-ch',
        name: 'Chorus',
        slideIds: ['slide-ch'],
      },
      {
        id: 'sec-v2',
        name: 'Verse 2',
        slideIds: ['slide-v2'],
      },
      {
        id: 'sec-br',
        name: 'Bridge',
        slideIds: ['slide-br'],
      },
    ],
    arrangements: [
      {
        id: 'arr-default',
        name: 'Default',
        slideIds: ['slide-v1', 'slide-ch', 'slide-v2', 'slide-br', 'slide-ch'],
      },
    ],
    slides: [
      {
        id: 'slide-v1',
        label: 'V1',
        items: [
          {
            type: 'text',
            plainText: 'Façade de grâce et de lumière\nAndroany no andro lehibe',
          },
        ],
      },
      {
        id: 'slide-ch',
        label: 'Chorus',
        items: [
          {
            type: 'text',
            plainText: "Miderà ny Tompo mandrakizay\nC'est un rempart que notre Dieu",
          },
        ],
      },
      {
        id: 'slide-v2',
        label: 'V2',
        items: [
          {
            type: 'text',
            plainText: 'A thousand generations falling down in worship\nTo the Lamb who was slain for all',
          },
        ],
      },
      {
        id: 'slide-br',
        label: 'Bridge',
        items: [
          {
            type: 'text',
            plainText: 'Holy forever, your name is the highest\nHallelujah, amen, amen',
          },
        ],
      },
    ],
    warnings: [],
  };
}

/**
 * Generates binary byte payloads for ProPresenter 7, FreeShow, and VideoPsalm
 */
export async function generateSandboxBytes(): Promise<SandboxBytes> {
  const pres = generateSandboxPresentation();

  // 1. ProPresenter 7 (.pro)
  const proRes = await exportPresentation(pres, 'pro');
  if (!proRes.ok) {
    throw new Error(`Failed to export ProPresenter test file: ${proRes.error.message}`);
  }

  // 2. FreeShow (.show)
  const showRes = await exportPresentation(pres, 'freeshow');
  if (!showRes.ok) {
    throw new Error(`Failed to export FreeShow test file: ${showRes.error.message}`);
  }

  // 3. VideoPsalm (.vpc)
  const singleLib = { presentations: [pres] };
  const vpcRes = await exportLibrary(singleLib, 'vpc');
  if (!vpcRes.ok) {
    throw new Error(`Failed to export VideoPsalm test file: ${vpcRes.error.message}`);
  }

  return {
    proBytes: proRes.value.bytes,
    showBytes: showRes.value.bytes,
    vpcBytes: vpcRes.value.bytes,
  };
}

/**
 * Derives and optionally writes sandbox test presentations into the target libraries.
 * Follows the Yachad mapping rule:
 * - ProPresenter: <proLibrariesRoot>/Yachad_Test/Yachad_Test_Hymn.pro
 * - FreeShow: <freeShowShowsRoot>/Yachad_Test/Yachad_Test_Hymn.show
 * - VideoPsalm: <videoPsalmSongbooksRoot>/Yachad_Test.vpc
 */
export function writeSandboxFiles(options: WriteSandboxOptions): SandboxPathsResult {
  const {
    proLibrariesRoot,
    freeShowShowsRoot,
    videoPsalmSongbooksRoot,
  } = options;

  const result: SandboxPathsResult = {};

  if (proLibrariesRoot) {
    result.proPath = `${normalizePath(proLibrariesRoot)}/Yachad_Test/Yachad_Test_Hymn.pro`;
  }

  if (freeShowShowsRoot) {
    result.showPath = `${normalizePath(freeShowShowsRoot)}/Yachad_Test/Yachad_Test_Hymn.show`;
  }

  if (videoPsalmSongbooksRoot) {
    result.vpcPath = `${normalizePath(videoPsalmSongbooksRoot)}/Yachad_Test.vpc`;
  }

  return result;
}

/**
 * Writes sandbox test files to actual disk in Tauri runtime.
 */
export async function executeSandboxDeployment(options: WriteSandboxOptions): Promise<SandboxPathsResult> {
  const paths = writeSandboxFiles(options);

  const isTauri =
    typeof window !== 'undefined' &&
    Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);

  if (!isTauri || options.dryRun) {
    return { ...paths, written: true };
  }

  try {
    const { writeFile, mkdir } = await import('@tauri-apps/plugin-fs');
    const bytes = await generateSandboxBytes();

    // 1. ProPresenter
    if (paths.proPath && bytes.proBytes) {
      const proDir = paths.proPath.substring(0, paths.proPath.lastIndexOf('/'));
      await mkdir(proDir, { recursive: true });
      await writeFile(paths.proPath, bytes.proBytes);
    }

    // 2. FreeShow
    if (paths.showPath && bytes.showBytes) {
      const showDir = paths.showPath.substring(0, paths.showPath.lastIndexOf('/'));
      await mkdir(showDir, { recursive: true });
      await writeFile(paths.showPath, bytes.showBytes);
    }

    // 3. VideoPsalm
    if (paths.vpcPath && bytes.vpcBytes) {
      const vpcDir = paths.vpcPath.substring(0, paths.vpcPath.lastIndexOf('/'));
      await mkdir(vpcDir, { recursive: true });
      await writeFile(paths.vpcPath, bytes.vpcBytes);
    }

    return { ...paths, written: true };
  } catch (err) {
    console.error('Failed to write sandbox files to disk:', err);
    return {
      ...paths,
      written: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
