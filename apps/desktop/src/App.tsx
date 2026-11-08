import { useState } from 'react';
import { SoftwareSetup, type DetectedSoftware } from './components/onboarding/SoftwareSetup';

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
    <div className="flex h-screen w-screen flex-col bg-background text-foreground font-sans">
      <header className="h-12 border-b border-border bg-card px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-base tracking-tight text-emerald-600 dark:text-emerald-400">
            Yachad
          </span>
          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground">
            Phase 01
          </span>
        </div>
        <button
          onClick={() => setShowSetup(true)}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
        >
          Reconfigure Libraries
        </button>
      </header>

      <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
        <h2 className="text-base font-bold mb-4">Connected Libraries</h2>
        <div className="space-y-3">
          {Object.entries(configuredSoftware).map(([app, cfg]) => (
            <div key={app} className="p-3 border border-border rounded-lg bg-card text-xs flex justify-between items-center">
              <div>
                <div className="font-semibold capitalize">{app}</div>
                <div className="font-mono text-muted-foreground text-[11px] truncate max-w-md">
                  {cfg.path || 'Not configured'}
                </div>
              </div>
              <span className={cfg.path ? 'text-emerald-600 font-medium' : 'text-muted-foreground'}>
                {cfg.path ? 'Connected' : 'Skipped'}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-6">
          Phase 01 active. Phase 02 will add live file reading and sandbox compatibility testing.
        </p>
      </main>
    </div>
  );
}
