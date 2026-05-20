export const theme = {
  bg: '#0a0a1a',
  bgCard: '#0f0f2a',
  bgCardHover: '#15153a',
  bgInput: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.08)',
  borderHover: 'rgba(108,99,255,0.3)',
  primary: '#6c63ff',
  primaryGlow: 'rgba(108,99,255,0.25)',
  primaryLight: 'rgba(108,99,255,0.12)',
  text: '#fff',
  textSecondary: '#8888aa',
  textMuted: '#555577',
  danger: '#ff6b6b',
  success: '#51cf66',
  warning: '#ffa94d',
  radius: 12,
  radiusSm: 8,
  radiusLg: 16,
  shadow: '0 8px 32px rgba(0,0,0,0.3)',
  transition: '0.25s cubic-bezier(0.4, 0, 0.2, 1)',
}

export const card = (hover = true): React.CSSProperties => ({
  background: theme.bgCard,
  borderRadius: theme.radius,
  border: `1px solid ${theme.border}`,
  transition: `all ${theme.transition}`,
  ...(hover ? {
    cursor: 'pointer',
  } : {}),
})

export const cardHover: React.CSSProperties = {
  transform: 'translateY(-4px)',
  boxShadow: `0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px ${theme.borderHover}`,
}

export const glass: React.CSSProperties = {
  background: 'rgba(15, 15, 42, 0.85)',
  backdropFilter: 'blur(20px) saturate(1.2)',
  WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
  borderBottom: `1px solid ${theme.border}`,
}

export const input: React.CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.9rem',
  borderRadius: theme.radiusSm,
  border: `1px solid ${theme.border}`,
  background: theme.bgInput,
  color: theme.text,
  fontSize: '0.9rem',
  outline: 'none',
  transition: `border-color ${theme.transition}`,
  boxSizing: 'border-box',
}

export const btn = (variant: 'primary' | 'ghost' | 'danger' = 'primary'): React.CSSProperties => {
  const colors = {
    primary: { bg: theme.primary, color: '#fff', border: 'none' },
    ghost: { bg: 'transparent', color: theme.textSecondary, border: `1px solid ${theme.border}` },
    danger: { bg: 'transparent', color: theme.danger, border: `1px solid ${theme.danger}` },
  }
  const c = colors[variant]
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.55rem 1.1rem',
    borderRadius: theme.radiusSm,
    background: c.bg,
    color: c.color,
    border: c.border,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.85rem',
    transition: `all ${theme.transition}`,
  }
}

export const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

export const glowBg: React.CSSProperties = {
  position: 'absolute',
  width: 400,
  height: 400,
  borderRadius: '50%',
  filter: 'blur(120px)',
  opacity: 0.15,
  pointerEvents: 'none',
}
