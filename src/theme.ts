export const colors = {
  primary: '#1A3CFF',
  primaryDark: '#0F23A8',
  primarySoft: '#E8ECFF',
  accent: '#FF6A13',
  accentSoft: '#FFF0E6',
  success: '#14A44D',
  successSoft: '#E5F6EC',
  danger: '#E5383B',
  dangerSoft: '#FDECEC',
  warning: '#F2A900',
  bg: '#F4F6FB',
  card: '#FFFFFF',
  text: '#121826',
  textMuted: '#5B6475',
  textFaint: '#9AA3B2',
  border: '#E3E7EF',
  white: '#FFFFFF',
};

export const modeColors = {
  bus: '#FF6A13',
  train: '#14A44D',
  flight: '#1A3CFF',
  hotel: '#B5179E',
} as const;

export const radius = { sm: 8, md: 12, lg: 18, xl: 24, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const font = {
  h1: { fontSize: 26, fontWeight: '800' as const, color: colors.text },
  h2: { fontSize: 20, fontWeight: '700' as const, color: colors.text },
  h3: { fontSize: 16, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 14, color: colors.text },
  small: { fontSize: 12, color: colors.textMuted },
  label: { fontSize: 12, fontWeight: '600' as const, color: colors.textMuted, letterSpacing: 0.4 },
};

export const shadow = {
  shadowColor: '#0B1533',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};
