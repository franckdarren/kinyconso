const ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': 'Email ou mot de passe incorrect',
  'Email not confirmed': 'Veuillez confirmer votre adresse email avant de vous connecter',
  'User already registered': 'Un compte existe déjà avec cet email',
  'Password should be at least 6 characters': 'Le mot de passe est trop court',
  'Unable to validate email address: invalid format': 'Email invalide',
  'Email rate limit exceeded': 'Trop de tentatives. Réessayez dans quelques minutes',
  'New password should be different from the old password':
    'Le nouveau mot de passe doit être différent de l’ancien',
  'Auth session missing!': 'Session expirée. Veuillez vous reconnecter',
  'For security purposes, you can only request this once every 60 seconds':
    'Veuillez patienter 60 secondes avant de réessayer',
}

export function translateAuthError(message: string): string {
  if (ERROR_MAP[message]) return ERROR_MAP[message]

  const partialKey = Object.keys(ERROR_MAP).find((key) =>
    message.toLowerCase().includes(key.toLowerCase()),
  )
  if (partialKey) return ERROR_MAP[partialKey]!

  return 'Une erreur est survenue. Veuillez réessayer.'
}
