// Design System baseado em Nielsen Norman Guidelines

export const colors = {
  primary: '#2DA44E',
  secondary: '#5856D6',
  accent: '#FF9500',
  
  background: '#000000',
  surface: '#1C1C1E',
  border: '#38383A',
  
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  
  success: '#2DA44E',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#2DA44E',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  h4: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  bodyLarge: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySmall: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  caption: { fontSize: 11, fontWeight: '400' as const, lineHeight: 14 },
} as const;

export const components = {
  button: {
    primary: { height: 48, borderRadius: 8, paddingHorizontal: 24 },
    secondary: { height: 40, borderRadius: 8, paddingHorizontal: 16 },
    small: { height: 32, borderRadius: 8, paddingHorizontal: 16 },
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  touchTarget: {
    minHeight: 44,
    minWidth: 44,
  },
} as const;

export const animations = {
  fast: 200,
  normal: 300,
  slow: 500,
} as const;
