export const USERS = [
  { name: 'You (Coordinator)', id: 'coordinator' },
  { name: 'Colleague 1', id: 'colleague1' },
  { name: 'Colleague 2', id: 'colleague2' },
]

export function setSession(userName: string) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('og_user', userName)
    sessionStorage.setItem('og_auth', 'true')
  }
}

export function getSession() {
  if (typeof window !== 'undefined') {
    return {
      authenticated: sessionStorage.getItem('og_auth') === 'true',
      user: sessionStorage.getItem('og_user') || '',
    }
  }
  return { authenticated: false, user: '' }
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('og_auth')
    sessionStorage.removeItem('og_user')
  }
}
