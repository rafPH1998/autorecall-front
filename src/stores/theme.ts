import { darkTheme, type GlobalTheme } from 'naive-ui';
import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';

const STORAGE_KEY = 'autorecall-theme';

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem(STORAGE_KEY) !== 'light');
  const theme = computed<GlobalTheme | null>(() => (isDark.value ? darkTheme : null));

  watch(
    isDark,
    (value) => {
      localStorage.setItem(STORAGE_KEY, value ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', value);
    },
    { immediate: true },
  );

  return { isDark, theme };
});
