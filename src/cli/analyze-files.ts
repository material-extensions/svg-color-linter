import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { glob } from 'glob';
import isGlob from 'is-glob';
import * as yaml from 'js-yaml';
import { minimatch } from 'minimatch';
import {
  Config,
  getColorsOfFile,
  getInvalidColorsOfFile,
  Results,
} from '../core';
import { containsBase64EncodedString, readSvgFile } from './utils';

export const analyzeFiles = async (
  filePatterns: string[],
  configFilePath: string
): Promise<Results> => {
  const result: Results = {
    invalidColorResults: [],
    base64Results: [],
    invalidSvgResults: [],
  };

  const config = yaml.load(await readFile(configFilePath, 'utf8')) as Config;

  const excludePatterns: string[] = config?.exclude || [];

  for (const filePattern of filePatterns) {
    const globFiles = isGlob(filePattern)
      ? await glob(filePattern)
      : [filePattern];

    for (const fileName of globFiles) {
      if (excludePatterns.some((pattern) => minimatch(fileName, pattern))) {
        continue;
      }

      const svgFileContent = await readSvgFile(fileName);
      const colors = getColorsOfFile(svgFileContent);

      const isSvg = (await import('is-svg')).default;

      const fileBasename = basename(fileName);

      if (containsBase64EncodedString(svgFileContent)) {
        result.base64Results.push({ file: fileBasename, base64Error: true });
      } else if (!isSvg(svgFileContent)) {
        result.invalidSvgResults.push({ file: fileBasename, invalidSvg: true });
      } else {
        result.invalidColorResults.push(
          ...getInvalidColorsOfFile(colors, config, fileBasename)
        );
      }
    }
  }
  return result;
};
