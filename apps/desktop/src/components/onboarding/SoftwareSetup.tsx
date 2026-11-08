import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { CheckCircle2, AlertCircle, FolderPlus, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { pickDirectory } from '../../lib/dialog';
import {
  resolveSoftwareLibraryPath,
  detectInstalledLibraries,
  type SupportedApp,
} from '../../lib/paths';

export interface SoftwareConfig {
  detected: boolean;
  path: string | null;
}

export interface DetectedSoftware {
  propresenter: SoftwareConfig;
  freeshow: SoftwareConfig;
  videopsalm: SoftwareConfig;
}

interface SoftwareSetupProps {
  initialSoftware?: DetectedSoftware;
  onComplete: (configured: DetectedSoftware) => void;
}

const APP_META: Record<SupportedApp, { name: string; description: string; expectedFolder: string }> = {
  propresenter: {
    name: 'ProPresenter 7',
    description: 'Main sanctuary projection & confidence screens',
    expectedFolder: 'Libraries',
  },
  freeshow: {
    name: 'FreeShow',
    description: 'Modern open-source presentation software',
    expectedFolder: 'shows',
  },
  videopsalm: {
    name: 'VideoPsalm',
    description: 'Hymnals, multilingual songbooks & chord charts',
    expectedFolder: 'Songbooks',
  },
};

export function SoftwareSetup({ initialSoftware, onComplete }: SoftwareSetupProps) {
  const [software, setSoftware] = useState<DetectedSoftware>(
    initialSoftware ?? {
      propresenter: { detected: false, path: null },
      freeshow: { detected: false, path: null },
      videopsalm: { detected: false, path: null },
    }
  );
  const [isDetecting, setIsDetecting] = useState(false);

  // Auto-detect installed presentation libraries on mount
  useEffect(() => {
    if (initialSoftware) return;

    let cancelled = false;
    async function runDetection() {
      setIsDetecting(true);
      try {
        const probed = await detectInstalledLibraries();
        if (cancelled) return;

        setSoftware((prev) => ({
          propresenter: probed.propresenter
            ? { detected: true, path: probed.propresenter }
            : prev.propresenter,
          freeshow: probed.freeshow
            ? { detected: true, path: probed.freeshow }
            : prev.freeshow,
          videopsalm: probed.videopsalm
            ? { detected: true, path: probed.videopsalm }
            : prev.videopsalm,
        }));
      } finally {
        if (!cancelled) setIsDetecting(false);
      }
    }

    void runDetection();
    return () => {
      cancelled = true;
    };
  }, [initialSoftware]);

  const handlePick = async (app: SupportedApp) => {
    try {
      const selected = await pickDirectory({
        title: `Select ${APP_META[app].name} Folder (or its ${APP_META[app].expectedFolder} folder)`,
      });

      if (selected && selected.trim()) {
        const resolved = resolveSoftwareLibraryPath(selected.trim(), app);
        setSoftware((prev) => ({
          ...prev,
          [app]: {
            detected: true,
            path: resolved,
          },
        }));
      }
    } catch (err) {
      console.error(`Failed to pick folder for ${app}:`, err);
    }
  };

  const configuredCount = Object.values(software).filter((s) => s.path !== null).length;
  const canContinue = configuredCount >= 2;

  return (
    <Card className="max-w-3xl mx-auto shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight text-emerald-600 dark:text-emerald-400">
              Yachad
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              Setup
            </Badge>
          </div>
          {isDetecting && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Scanning for installed software...
            </span>
          )}
        </div>
        <CardTitle className="text-lg font-bold mt-1">Connect Your Presentation Libraries</CardTitle>
        <CardDescription>
          Yachad probes your workstation configuration files to automatically detect installed presentation software.
          You can also manually pick any software root or library folder.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {(['propresenter', 'freeshow', 'videopsalm'] as SupportedApp[]).map((app) => {
          const meta = APP_META[app];
          const config = software[app];
          const isConfigured = Boolean(config.path);

          return (
            <div
              key={app}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border border-border bg-card/60 shadow-2xs gap-3"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{meta.name}</span>
                  {isConfigured ? (
                    <Badge variant="default" className="text-[10px] py-0 px-2 gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Auto-Detected & Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] py-0 px-2 gap-1 text-muted-foreground">
                      <AlertCircle className="w-3 h-3" />
                      Not Found
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">{meta.description}</p>
                {config.path ? (
                  <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 truncate mt-0.5">
                    {config.path}
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground italic mt-0.5">
                    Click &quot;Select {meta.name} Folder&quot; to locate manually
                  </span>
                )}
              </div>

              <Button
                variant={isConfigured ? 'outline' : 'default'}
                size="sm"
                onClick={() => handlePick(app)}
                className="shrink-0 gap-1.5 self-start sm:self-auto text-xs"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>{isConfigured ? 'Change Folder...' : `Select ${meta.name} Folder...`}</span>
              </Button>
            </div>
          );
        })}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/30">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {canContinue
              ? `${configuredCount} of 3 presentation libraries connected. Ready to start.`
              : 'Connect at least 2 presentation libraries to enable synchronization.'}
          </span>
        </div>

        <Button
          disabled={!canContinue}
          onClick={() => onComplete(software)}
          className="gap-1.5 font-medium shrink-0"
        >
          <span>Confirm & Start Yachad</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
