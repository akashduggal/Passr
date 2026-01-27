/**
 * ASU (Arizona State University) official brand color palette.
 * @see https://brandguide.asu.edu/brand-elements/design/color
 */

export const ASU = {
  // Primary
  maroon: '#8C1D40',
  gold: '#FFC627',
  black: '#000000',
  white: '#FFFFFF',

  // Grayscale (ASU grayscale for UI)
  gray1: '#191919',
  gray2: '#484848',
  gray: '#747474', // ASU Gray
  gray4: '#BFBFBF',
  gray5: '#D0D0D0',
  gray6: '#E8E8E8',
  gray7: '#FAFAFA',

  // Secondary (accent use only, sparingly)
  green: '#78BE20',
  blue: '#00A3E0',
  orange: '#FF7F32',
  copper: '#AF674B',
  turquoise: '#4AB7C4',
  pink: '#E74973',
};

/** Light theme tokens for app UI. Primary = Maroon, backgrounds = grayscale/white. */
export const lightTheme = {
  background: ASU.gray7,
  surface: ASU.white,
  primary: ASU.maroon,
  primaryText: ASU.white,
  text: ASU.gray1,
  textSecondary: ASU.gray,
  label: ASU.gray2,
  border: ASU.gray6,
  placeholder: ASU.gray,
  link: ASU.maroon,
};

/** Dark theme tokens for app UI. */
export const darkTheme = {
  background: ASU.gray1,
  surface: ASU.gray2,
  primary: ASU.maroon,
  primaryText: ASU.white,
  text: ASU.white,
  textSecondary: ASU.gray4,
  label: ASU.gray4,
  border: ASU.gray2,
  placeholder: ASU.gray,
  link: ASU.gold,
};

/** Default theme (light) for backward compatibility */
export const theme = lightTheme;

/** Get theme based on dark mode */
export const getTheme = (isDarkMode) => {
  return isDarkMode ? darkTheme : lightTheme;
};
