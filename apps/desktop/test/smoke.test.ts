import { describe, expect, it } from 'vitest';
import { FORMAT_REGISTRY } from '@skeuos-labs/mizmor';

describe('Yachad Scaffold', () => {
  it('loads mizmor format registry successfully', () => {
    expect(Array.isArray(FORMAT_REGISTRY)).toBe(true);
    expect(FORMAT_REGISTRY.map(f => f.id)).toContain('pro');
    expect(FORMAT_REGISTRY.map(f => f.id)).toContain('freeshow');
    expect(FORMAT_REGISTRY.map(f => f.id)).toContain('vpc');
  });
});
