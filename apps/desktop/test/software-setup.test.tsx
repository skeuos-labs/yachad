import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { SoftwareSetup, type DetectedSoftware } from '../src/components/onboarding/SoftwareSetup';
import * as dialogModule from '../src/lib/dialog';

describe('SoftwareSetup Onboarding UI', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders status cards for ProPresenter, FreeShow, and VideoPsalm', () => {
    const mockInitial: DetectedSoftware = {
      propresenter: { detected: true, path: 'C:/Users/Worship/Documents/ProPresenter/Libraries' },
      freeshow: { detected: true, path: 'C:/Users/Worship/Documents/FreeShow/shows' },
      videopsalm: { detected: false, path: null },
    };

    render(<SoftwareSetup initialSoftware={mockInitial} onComplete={() => {}} />);

    expect(screen.getByText('ProPresenter 7')).toBeDefined();
    expect(screen.getByText('FreeShow')).toBeDefined();
    expect(screen.getByText('VideoPsalm')).toBeDefined();

    expect(screen.getByText('C:/Users/Worship/Documents/ProPresenter/Libraries')).toBeDefined();
    expect(screen.getByText('C:/Users/Worship/Documents/FreeShow/shows')).toBeDefined();
    expect(screen.getByText(/not found/i)).toBeDefined();
  });

  it('triggers folder picker and smart-resolves subfolder on folder selection', async () => {
    vi.spyOn(dialogModule, 'pickDirectory').mockResolvedValue('D:/Custom/VideoPsalm');

    render(<SoftwareSetup onComplete={() => {}} />);

    const vpSelectBtn = screen.getByRole('button', { name: /select.*videopsalm/i });
    await act(async () => {
      fireEvent.click(vpSelectBtn);
    });

    // Subfolder "Songbooks" is automatically resolved
    expect(screen.getByText('D:/Custom/VideoPsalm/Songbooks')).toBeDefined();
  });

  it('enables Continue button when at least two applications are configured', () => {
    const mockInitial: DetectedSoftware = {
      propresenter: { detected: true, path: 'C:/Pro' },
      freeshow: { detected: true, path: 'C:/FreeShow' },
      videopsalm: { detected: false, path: null },
    };

    const completeSpy = vi.fn();
    render(<SoftwareSetup initialSoftware={mockInitial} onComplete={completeSpy} />);

    const continueBtn = screen.getByRole('button', { name: /confirm & start yachad/i });
    expect((continueBtn as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(continueBtn);
    expect(completeSpy).toHaveBeenCalledWith(mockInitial);
  });
});
