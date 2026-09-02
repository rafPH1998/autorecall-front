import { NIcon } from 'naive-ui';
import { type Component, h } from 'vue';

export function renderIcon(icon: Component) {
  return () => h(NIcon, { size: 18 }, { default: () => h(icon) });
}
