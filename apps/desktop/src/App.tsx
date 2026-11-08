import { useState } from 'react';
import { SoftwareSetup, type DetectedSoftware } from './components/onboarding/SoftwareSetup';
import { SandboxSpikeCard } from './components/spike/SandboxSpikeCard';

const SETUP_STORAGE_KEY = 'yachad.configuredSoftware';

function loadStoredSoftware(): DetectedSoftware | undefined {
  try {
    if (typeof localStorage === 'undefined') return undefined;
    const raw = localStorage.getItem(SETUP_STORAGE_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

function saveStoredSoftware(config: DetectedSoftware): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify(config));
    }
  } catch {}
}

export default function App() {
  const [configuredSoftware, setConfiguredSoftware] = useState<DetectedSoftware | undefined>(loadStoredSoftware);
  const [showSetup, setShowSetup] = useState<boolean>(() => !loadStoredSoftware());

  const handleCompleteSetup = (config: DetectedSoftware) => {
    saveStoredSoftware(config);
    setConfiguredSoftware(config);
    setShowSetup(false);
  };

  if (showSetup || !configuredSoftware) {
    return (
      <div className="min-h-screen w-screen bg-background text-foreground py-10 px-4">
        <SoftwareSetup
          initialSoftware={configuredSoftware}
          onComplete={handleCompleteSetup}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-background text-foreground font-sans overflow-hidden">
      <header className="h-12 border-b border-border bg-card px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-base tracking-tight text-emerald-600 dark:text-emerald-400">
            Yachad
          </span>
          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground">
            Phase 02: Compatibility Spike
          </span>
        </div>
        <button
          onClick={() => setShowSetup(true)}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 cursor-pointer"
        >
          Reconfigure Libraries
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full space-y-6">
        <div>
          <h2 className="text-base font-bold mb-3">Connected Libraries</h2>
          <div className="space-y-2.5">
            {Object.entries(configuredSoftware).map(([app, cfg]) => (
              <div key={app} className="p-3 border border-border rounded-lg bg-card text-xs flex justify-between items-center shadow-2xs">
                <div>
                  <div className="font-semibold capitalize">{app}</div>
                  <div className="font-mono text-muted-foreground text-[11px] truncate max-w-md mt-0.5">
                    {cfg.path || 'Not configured'}
                  </div>
                </div>
                <span className={cfg.path ? 'text-emerald-600 font-medium' : 'text-muted-foreground'}>
                  {cfg.path ? 'Connected' : 'Skipped'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Phase 02 Live Compatibility Spike */}
        <SandboxSpikeCard software={configuredSoftware} />
      </main>
    </div>
  );
}
