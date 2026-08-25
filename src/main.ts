import { createApp } from 'vue';
import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import StyleClass from 'primevue/styleclass';
import ToastService from 'primevue/toastservice';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/auth';

import '@/assets/tailwind.css';
import '@/assets/styles.scss';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.app-dark',
    },
  },
});
app.use(ToastService);
app.use(ConfirmationService);
app.directive('styleclass', StyleClass);

const auth = useAuthStore();
auth.hydrate().finally(() => {
  app.use(router);
  app.mount('#app');
});
