import { atom } from 'jotai';

export const THEME_MODES = ['light', 'dark'] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

export const DEFAULT_THEME: ThemeMode = 'light';
export const THEME_STORAGE_KEY = 'assetflow-theme';

export const themeAtom = atom<ThemeMode>(DEFAULT_THEME);
