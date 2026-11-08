import { render, screen, fireEvent, cleanup, act, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { SandboxSpikeCard } from '../src/components/spike/SandboxSpikeCard';
import * as spikeModule from '../src/lib/spike';
import type { DetectedSoftware } from '../src/components/onboarding/SoftwareSetup';

describe('SandboxSpikeCard UI', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const mockSoftware: DetectedSoftware = {
    propresenter: { detected: true, path: 'D:/Documents/ProPresenter/Libraries' },
    freeshow: { detected: true, path: 'D:/Documents/FreeShow/Shows' },
    videopsalm: { detected: true, path: 'C:/Users/Public/Documents/VideoPsalm/SongBooks' },
  };

  it('renders trigger button and target destination paths', () => {
    render(<SandboxSpikeCard software={mockSoftware} />);

    expect(screen.getByText(/Phase 02: Live Software Compatibility Spike/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /generate yachad_test sandbox files/i })).toBeDefined();
  });

  it('triggers execution and displays verification checklist when files are generated', async () => {
    const deploySpy = vi.spyOn(spikeModule, 'executeSandboxDeployment').mockResolvedValue({
      proPath: 'D:/Documents/ProPresenter/Libraries/Yachad_Test/Yachad_Test_Hymn.pro',
      showPath: 'D:/Documents/FreeShow/Shows/Yachad_Test/Yachad_Test_Hymn.show',
      vpcPath: 'C:/Users/Public/Documents/VideoPsalm/SongBooks/Yachad_Test.vpc',
      written: true,
    });

    render(<SandboxSpikeCard software={mockSoftware} />);

    const generateBtn = screen.getByRole('button', { name: /generate yachad_test sandbox files/i });
    await act(async () => {
      fireEvent.click(generateBtn);
    });

    expect(deploySpy).toHaveBeenCalledWith({
      proLibrariesRoot: 'D:/Documents/ProPresenter/Libraries',
      freeShowShowsRoot: 'D:/Documents/FreeShow/Shows',
      videoPsalmSongbooksRoot: 'C:/Users/Public/Documents/VideoPsalm/SongBooks',
    });

    await waitFor(() => {
      expect(screen.getByText(/Generated Sandbox Files/i)).toBeDefined();
      expect(screen.getByText(/D:\/Documents\/ProPresenter\/Libraries\/Yachad_Test\/Yachad_Test_Hymn\.pro/i)).toBeDefined();
      expect(screen.getByText(/Open ProPresenter 7/i)).toBeDefined();
      expect(screen.getByText(/Open FreeShow/i)).toBeDefined();
      expect(screen.getByText(/Open VideoPsalm/i)).toBeDefined();
    });
  });
});
