import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { api, getToken, setToken } from '@/services/api';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

const SESSION_FLAG = 'autorecall-session';

function isAdminRole(role?: string | null) {
  const normalized = (role ?? '').trim().toLocaleLowerCase();
  return normalized === 'administrador' || normalized === 'admin' || normalized === 'owner';
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null);
  const isAuthenticated = computed(() => Boolean(user.value && getToken()));
  const isAdmin = computed(() => isAdminRole(user.value?.role));

  async function hydrate() {
    if (!getToken()) {
      user.value = null;
      localStorage.removeItem(SESSION_FLAG);
      return;
    }
    try {
      user.value = await api<AuthUser>('/auth/me');
      localStorage.setItem(SESSION_FLAG, '1');
    } catch {
      setToken(null);
      user.value = null;
      localStorage.removeItem(SESSION_FLAG);
    }
  }

  async function login(email: string, password: string) {
    const result = await api<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(result.token);
    user.value = result.user;
    localStorage.setItem(SESSION_FLAG, '1');
  }

  function logout() {
    user.value = null;
    setToken(null);
    localStorage.removeItem(SESSION_FLAG);
  }

  return { user, isAuthenticated, isAdmin, hydrate, login, logout };
});
