import { computed, reactive } from 'vue';

export type MenuMode = 'static' | 'overlay';

export const layoutConfig = reactive({
  preset: 'Aura',
  primary: 'emerald',
  surface: null as string | null,
  darkTheme: false,
  menuMode: 'static' as MenuMode,
});

export const layoutState = reactive({
  staticMenuInactive: false,
  overlayMenuActive: false,
  profileSidebarVisible: false,
  configSidebarVisible: false,
  sidebarExpanded: false,
  menuHoverActive: false,
  mobileMenuActive: false,
  anchored: false,
  activeMenuItem: null as string | null,
  activePath: null as string | null,
});

export function useLayout() {
  const toggleDarkMode = () => {
    const toggle = () => {
      layoutConfig.darkTheme = !layoutConfig.darkTheme;
      document.documentElement.classList.toggle('app-dark');
    };

    if (!document.startViewTransition) {
      toggle();
      return;
    }

    document.startViewTransition(toggle);
  };

  const isDesktop = () => window.innerWidth > 991;

  const toggleMenu = () => {
    if (isDesktop()) {
      if (layoutConfig.menuMode === 'static') {
        layoutState.staticMenuInactive = !layoutState.staticMenuInactive;
      }
      if (layoutConfig.menuMode === 'overlay') {
        layoutState.overlayMenuActive = !layoutState.overlayMenuActive;
      }
    } else {
      layoutState.mobileMenuActive = !layoutState.mobileMenuActive;
    }
  };

  const toggleConfigSidebar = () => {
    layoutState.configSidebarVisible = !layoutState.configSidebarVisible;
  };

  const hideMobileMenu = () => {
    layoutState.mobileMenuActive = false;
  };

  const changeMenuMode = (event: { value: MenuMode }) => {
    layoutConfig.menuMode = event.value;
    layoutState.staticMenuInactive = false;
    layoutState.mobileMenuActive = false;
    layoutState.sidebarExpanded = false;
    layoutState.menuHoverActive = false;
    layoutState.anchored = false;
  };

  return {
    layoutConfig,
    layoutState,
    isDarkTheme: computed(() => layoutConfig.darkTheme),
    toggleDarkMode,
    toggleConfigSidebar,
    toggleMenu,
    hideMobileMenu,
    changeMenuMode,
    isDesktop,
    hasOpenOverlay: computed(() => layoutState.overlayMenuActive),
  };
}
