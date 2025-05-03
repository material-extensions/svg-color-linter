import chroma from 'chroma-js';

const isValidColor = (hexColor: string | undefined): boolean => {
  if (hexColor === undefined) {
    return false;
  }
  return chroma.valid(hexColor);
};

export { isValidColor };
