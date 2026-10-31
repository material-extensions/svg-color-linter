import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { analyzeFiles } from './analyze-files';

describe('analyzeFiles', () => {
  let directory: string;
  let configPath: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'svg-color-linter-'));
    configPath = join(directory, 'colors.yml');
    await writeFile(configPath, 'colors:\n  - "#ff0000"\n');
    await writeFile(
      join(directory, 'valid.svg'),
      '<svg xmlns="http://www.w3.org/2000/svg"><path fill="#ff0000" /></svg>'
    );
    await writeFile(
      join(directory, 'invalid.svg'),
      '<svg xmlns="http://www.w3.org/2000/svg"><path fill="#00ff00" /></svg>'
    );
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('expands glob patterns and reports invalid colors', async () => {
    const result = await analyzeFiles([`${directory}/*.svg`], configPath);

    expect(result.invalidColorResults).toHaveLength(1);
    expect(result.invalidColorResults[0].file).toBe('invalid.svg');
    expect(result.invalidSvgResults).toEqual([]);
  });

  it('honors YAML exclusion patterns', async () => {
    await writeFile(
      configPath,
      'colors:\n  - "#ff0000"\nexclude:\n  - "**/invalid.svg"\n'
    );

    const result = await analyzeFiles([`${directory}/*.svg`], configPath);

    expect(result.invalidColorResults).toEqual([]);
  });

  it('accepts explicit file paths without glob expansion', async () => {
    const result = await analyzeFiles(
      [join(directory, 'valid.svg')],
      configPath
    );

    expect(result.invalidColorResults).toEqual([]);
    expect(result.invalidSvgResults).toEqual([]);
  });
});
