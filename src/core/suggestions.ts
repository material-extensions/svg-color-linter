import chroma from 'chroma-js';
import { ColorSuggestion } from './models';
import { isValidColor, toHexColor } from './utils';

const getSuggestions = (
  color: string,
  palette: string[]
): ColorSuggestion[] => {
  if (!isValidColor(color)) {
    throw new Error(`The given color "${color}" is not valid!`);
  }

  color = toHexColor(color);

  const distances = palette
    .map((paletteColor) => ({
      distance: chroma.deltaE(paletteColor, color),
      color: paletteColor,
    }))
    .sort((a, b) => a.distance - b.distance);

  const suggestedColors: ColorSuggestion[] = [];

  // pick five colors with the lowest distance to the input color
  distances.slice(0, 5).forEach((distance) => {
    const suggestedColor = distance.color;
    suggestedColors.push({
      hex: suggestedColor,
      distance: distance.distance,
    });
  });

  return suggestedColors;
};

export { getSuggestions };
