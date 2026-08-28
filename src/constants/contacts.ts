export const CONTACT_RESULTS = [
  'Aguardando resposta',
  'Mensagem visualizada',
  'Sem resposta',
  'Agendado',
  'Não tem interesse',
  'Já fez em outro lugar',
  'Vai pensar',
] as const;

export const PENDING_CONTACT_RESULTS = [
  'Aguardando resposta',
  'Mensagem visualizada',
  'Sem resposta',
] as const;

export function isPendingContactResult(result: string) {
  if (result.toLocaleLowerCase().startsWith('agendado')) return false;
  return (PENDING_CONTACT_RESULTS as readonly string[]).includes(result);
}

export function contactResultOptions(current?: string) {
  if (!current || (CONTACT_RESULTS as readonly string[]).includes(current)) {
    return [...CONTACT_RESULTS];
  }
  return [current, ...CONTACT_RESULTS];
}
