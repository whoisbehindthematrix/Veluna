export const palette = {
	pink50: '#fdf2f8',
	pink100: '#fce7f3',
	pink500: '#ec4899',
	orange400: '#f97316',
	purple400: '#8b5cf6',
	green500: '#10b981',
	neutral50: '#f8fafc',
	neutral100: '#f3f4f6',
	neutral500: '#6b7280',
	neutral900: '#212023',
	white: '#ffffff',
	black: '#161616',
  };
  
  export const lightTheme = {
	mode: 'light' as const,
	background: palette.neutral50,
	cardBackground: palette.white,
	headerGradient: [palette.pink50, palette.neutral50] as const,
	textPrimary: palette.neutral900,
	textSecondary: palette.neutral500,
	primary: palette.pink500,
	primarySoft: palette.pink50,
	accent: palette.orange400,
	success: palette.green500,
	border: palette.pink100,
	shadow: palette.pink500,
  };
  
  export const darkTheme: typeof lightTheme = {
	mode: 'dark',
	background: palette.black,
	cardBackground: '#212023',
	headerGradient: ['#1f1b24', '#212023'] as const,
	textPrimary: palette.white,
	textSecondary: '#d1d5db',
	primary: '#f472b6',
	primarySoft: '#3b1f2b',
	accent: '#fb923c',
	success: '#34d399',
	border: '#374151',
	shadow: '#111827',
  };
  
  export type ThemeName = 'light' | 'dark';
  export const themes: Record<ThemeName, typeof lightTheme> = {
	light: lightTheme,
	dark: darkTheme,
  };
  
  export type AppTheme = typeof lightTheme;
  
  export function getTheme(name?: ThemeName) {
	return themes[name ?? 'light'];
  }