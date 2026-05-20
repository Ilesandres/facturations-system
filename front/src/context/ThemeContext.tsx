import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  resolved: 'light' | 'dark'
  setTheme: (t: Theme) => void
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType)

function resolve(t: Theme): 'light' | 'dark' {
  if (t === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return t
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem('novamart-theme') as Theme) || 'system')
  const [resolved, setResolved] = useState<'light' | 'dark'>(() => resolve(theme))

  const apply = useCallback((t: Theme) => {
    const r = resolve(t)
    document.documentElement.classList.toggle('dark', r === 'dark')
    setResolved(r)
  }, [])

  useEffect(() => {
    apply(theme)
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => { if (theme === 'system') apply('system') }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme, apply])

  function setTheme(t: Theme) {
    localStorage.setItem('novamart-theme', t)
    setThemeState(t)
  }

  function toggle() {
    setTheme(resolved === 'dark' ? 'light' : 'dark')
  }

  return <ThemeContext.Provider value={{ theme, resolved, setTheme, toggle }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
