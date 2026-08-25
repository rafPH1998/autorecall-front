import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

const SESSION_KEY = 'autorecall-session';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ name: string; email: string } | null>(
    localStorage.getItem(SESSION_KEY)
      ? { name: 'Rafael Pereira', email: 'rafael@autocenter.com.br' }
      : null,
  );

  const isAuthenticated = computed(() => Boolean(user.value));

  async function login(email: string, password: string) {
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    if (!email || password.length < 6) throw new Error('Informe um e-mail e uma senha com pelo menos 6 caracteres.');
    user.value = { name: 'Rafael Pereira', email };
    localStorage.setItem(SESSION_KEY, 'mock-token');
  }

  function logout() {
    user.value = null;
    localStorage.removeItem(SESSION_KEY);
  }

  return { user, isAuthenticated, login, logout };
});
