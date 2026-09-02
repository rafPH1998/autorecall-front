import type { GlobalThemeOverrides } from 'naive-ui';

const primary = '#3B82F6';
const primaryHover = '#60A5FA';
const primaryPressed = '#2563EB';

export const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: primary,
    primaryColorHover: primaryHover,
    primaryColorPressed: primaryPressed,
    primaryColorSuppl: primary,
    borderRadius: '10px',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  },
  Button: {
    borderRadiusMedium: '10px',
  },
  Card: {
    borderRadius: '14px',
  },
};
