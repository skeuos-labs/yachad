import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FlaskConical, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, CheckSquare } from 'lucide-react';
import { executeSandboxDeployment, type SandboxPathsResult } from '../../lib/spike';
import type { DetectedSoftware } from '../onboarding/SoftwareSetup';

interface SandboxSpikeCardProps {
  software: DetectedSoftware;
}

export function SandboxSpikeCard({ software }: SandboxSpikeCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<SandboxPathsResult | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await executeSandboxDeployment({
        proLibrariesRoot: software.propresenter.path ?? undefined,
        freeShowShowsRoot: software.freeshow.path ?? undefined,
        videoPsalmSongbooksRoot: software.videopsalm.path ?? undefined,
      });
      setResult(res);
    } catch (err) {
      setResult({
        written: false,
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-600">
              <FlaskConical className="w-4 h-4" />
            </span>
            <CardTitle className="text-sm font-bold text-foreground">
              Phase 02: Live Software Compatibility Spike
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/40 text-emerald-700 dark:text-emerald-400">
            Sandbox Library: Yachad_Test
          </Badge>
        </div>
        <CardDescription>
          Generates test presentation files containing multi-section lyrics, slide breaks, and French &amp; Malagasy
          accents (<span className="font-mono">Façade</span>, <span className="font-mono">Androany</span>, <span className="font-mono">Miderà</span>)
          directly into your connected applications to prove real-world compatibility before enabling continuous sync.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {result?.written && (
          <div className="flex flex-col gap-3 p-3.5 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Generated Sandbox Files</span>
            </div>

            <div className="space-y-1.5 text-[11px] font-mono bg-muted/50 p-2.5 rounded border border-border/60">
              {result.proPath && (
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase font-sans font-bold">ProPresenter 7:</span>
                  <span className="text-foreground truncate">{result.proPath}</span>
                </div>
              )}
              {result.showPath && (
                <div className="flex flex-col mt-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-sans font-bold">FreeShow:</span>
                  <span className="text-foreground truncate">{result.showPath}</span>
                </div>
              )}
              {result.vpcPath && (
                <div className="flex flex-col mt-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-sans font-bold">VideoPsalm:</span>
                  <span className="text-foreground truncate">{result.vpcPath}</span>
                </div>
              )}
            </div>

            {/* Verification Checklist */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-border/50 text-xs text-foreground">
              <span className="font-semibold flex items-center gap-1.5 text-muted-foreground text-[11px]">
                <CheckSquare className="w-3.5 h-3.5" />
                Human Review Checklist:
              </span>
              <ul className="space-y-1 text-[11px] list-disc list-inside text-muted-foreground pl-1">
                <li>
                  <strong className="text-foreground">Open ProPresenter 7:</strong> Look for library <span className="font-mono text-foreground">Yachad_Test</span>, click <span className="font-mono text-foreground">Yachad Test Hymn</span>, check slides &amp; accents.
                </li>
                <li>
                  <strong className="text-foreground">Open FreeShow:</strong> Look for folder <span className="font-mono text-foreground">shows/Yachad_Test/</span>, verify slides render.
                </li>
                <li>
                  <strong className="text-foreground">Open VideoPsalm:</strong> Open songbook <span className="font-mono text-foreground">Yachad_Test.vpc</span>, check hymn index and verses.
                </li>
              </ul>
            </div>
          </div>
        )}

        {result?.error && (
          <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-600">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Generation failed: {result.error}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center bg-card/40">
        <span className="text-[11px] text-muted-foreground">
          Zero risk: writes only to the isolated <span className="font-mono">Yachad_Test</span> folder / songbook.
        </span>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          size="sm"
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Generating Sandbox Files...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Yachad_Test Sandbox Files</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
