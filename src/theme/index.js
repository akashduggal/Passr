/**
 * ASU (Arizona State University) official brand color palette.
 * @see https://brandguide.asu.edu/brand-elements/design/color
 * 
 * NOTE: Temporarily commented out.
 * Saved for future partnership implementation.
 */
/*
export const ASU_OFFICIAL = {
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
*/

/**
 * Modern Sustainable Marketplace Palette
 * Theme: "Eco-Conscious & Connected"
 * 
 * Design Philosophy:
 * - Clean, breathable whitespace (Modern/Google-esque)
 * - Deep Teals/Greens: Representing sustainability, trust, and growth.
 * - Warm Coral/Orange: Adding youthful energy and action without being aggressive.
 * - Soft Grays (Slate): For a polished, high-end tech feel.
 */
export const Palette = {
  // Primary Brand Colors (Teal/Emerald - Sustainability & Trust)
  primary: '#0F766E',    // Teal-700: Sophisticated, rich teal. Dark enough for white text.
  primaryDark: '#115E59', // Teal-800: Deep interaction state
  primaryLight: '#2DD4BF', // Teal-400: Bright highlights
  
  // Secondary Brand Colors (Coral - Energy & Action)
  secondary: '#F43F5E',  // Rose-500: Vibrant but not harsh. Replaces "Gold" for high contrast.
  secondaryLight: '#FB7185', // Rose-400

  // Neutrals (Slate - Clean & Technical)
  background: '#FFFFFF', // Pure White
  surface: '#F8FAFC',    // Slate-50: Very subtle off-white for cards
  textPrimary: '#0F172A', // Slate-900: Deep blue-black, softer than pure black
  textSecondary: '#475569', // Slate-600: High readability gray
  textTertiary: '#94A3B8', // Slate-400
  
  // Dark Mode Neutrals
  darkBackground: '#0F172A', // Slate-900
  darkSurface: '#1E293B',    // Slate-800
  darkTextPrimary: '#F8FAFC', // Slate-50
  darkTextSecondary: '#94A3B8', // Slate-400
  darkBorder: '#334155',     // Slate-700
  
  // UI Elements
  border: '#E2E8F0',     // Slate-200: Crisp, subtle borders
  divider: '#F1F5F9',    // Slate-100
  
  // Functional Colors
  success: '#10B981',    // Emerald-500
  error: '#EF4444',      // Red-500
  warning: '#F59E0B',    // Amber-500
  info: '#3B82F6',       // Blue-500

  // ------------------------------------------------------------------
  // COMPATIBILITY MAPPING (ASU -> Modern Theme)
  // Maps existing codebase references to the new sustainable palette
  // ------------------------------------------------------------------
  
  maroon: '#0F766E',     // Maps "Maroon" (Primary) -> Teal
  gold: '#F43F5E',       // Maps "Gold" (Secondary) -> Coral/Rose (High Contrast)
  
  white: '#FFFFFF',
  black: '#0F172A',      // Maps Black -> Slate-900
  
  // Grayscale Mapping (Slate Series)
  gray1: '#0F172A',
  gray2: '#334155',
  gray: '#64748B',
  gray4: '#94A3B8',
  gray5: '#CBD5E1',
  gray6: '#E2E8F0',
  gray7: '#F8FAFC',
  
  // Accent Mapping
  green: '#10B981',
  blue: '#3B82F6',
  orange: '#F97316',
  pink: '#F43F5E',
};

// Export Palette as "ASU" to maintain app functionality without refactoring every file
export const ASU = Palette;

/** Light theme tokens for app UI. */
export const lightTheme = {
  background: Palette.background,
  surface: Palette.surface,
  primary: Palette.primary,
  primaryText: Palette.white,
  text: Palette.textPrimary,
  textSecondary: Palette.textSecondary,
  label: Palette.textSecondary,
  border: Palette.border,
  placeholder: Palette.textTertiary,
  link: Palette.primary,
};

/** Dark theme tokens for app UI. */
export const darkTheme = {
  background: Palette.darkBackground,
  surface: Palette.darkSurface,
  primary: Palette.primaryLight, // Brighter teal for dark mode visibility
  primaryText: Palette.darkBackground,
  text: Palette.darkTextPrimary,
  textSecondary: Palette.darkTextSecondary,
  label: Palette.darkTextSecondary,
  border: Palette.darkBorder,
  placeholder: Palette.textSecondary,
  link: Palette.primaryLight,
};

/** Default theme (light) for backward compatibility */
export const theme = lightTheme;

/** Get theme based on dark mode */
export const getTheme = (isDarkMode) => {
  return isDarkMode ? darkTheme : lightTheme;
};
