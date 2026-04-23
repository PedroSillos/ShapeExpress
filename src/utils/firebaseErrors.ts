export function getFirebaseErrorMessage(error: any): string {
  if (typeof error === 'string') return error;

  try {
    if (error?.message) {
      const parsed = JSON.parse(error.message);
      if (parsed.error === 'Missing or insufficient permissions') {
        return 'Você não tem permissão para realizar esta ação no momento.';
      }
    }
  } catch (e) {
    // Not valid JSON in message
  }

  // Common Auth Errors
  const authErrors: Record<string, string> = {
    'auth/email-already-in-use': 'Este e-mail já está em uso por outra conta.',
    'auth/invalid-email': 'O e-mail informado não é válido.',
    'auth/operation-not-allowed': 'Esta operação não está permitida no momento.',
    'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
    'auth/user-disabled': 'Esta conta foi desativada.',
    'auth/user-not-found': 'Usuário não encontrado. O e-mail não está cadastrado.',
    'auth/wrong-password': 'Senha incorreta. Tente novamente.',
    'auth/invalid-credential': 'As credenciais são inválidas.',
    'auth/too-many-requests': 'Muitas tentativas de login. Tente novamente mais tarde.',
    'auth/popup-closed-by-user': 'O login foi cancelado.',
    'permission-denied': 'Permissão negada. Você não tem acesso a este recurso.'
  };

  if (error?.code && authErrors[error.code]) {
    return authErrors[error.code];
  }

  return error?.message || 'Ocorreu um erro desconhecido.';
}
