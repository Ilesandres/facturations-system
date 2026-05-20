import type { CSSProperties } from 'react'

export const theme = {
  bg: 'var(--bg)',
  bgCard: 'var(--bg-card)',
  bgCardHover: 'var(--bg-card-hover)',
  bgInput: 'var(--bg-input)',
  border: 'var(--border)',
  borderHover: 'var(--border-hover)',
  primary: 'var(--primary)',
  primaryGlow: 'var(--primary-glow)',
  primaryLight: 'var(--primary-light)',
  text: 'var(--text)',
  textSecondary: 'var(--text-secondary)',
  textMuted: 'var(--text-muted)',
  danger: 'var(--danger)',
  dangerLight: 'var(--danger-light)',
  success: 'var(--success)',
  successLight: 'var(--success-light)',
  warning: 'var(--warning)',
  warningLight: 'var(--warning-light)',
  radius: 'var(--radius)',
  radiusSm: 'var(--radius-sm)',
  radiusLg: 'var(--radius-lg)',
  shadow: 'var(--shadow)',
  shadowLg: 'var(--shadow-lg)',
  transition: 'var(--transition)',
  glassBg: 'var(--glass-bg)',
  glassBorder: 'var(--glass-border)',
  glassShadow: 'var(--glass-shadow)',
}

export const card = (hover = true): CSSProperties => ({
  background: theme.bgCard,
  borderRadius: theme.radius,
  border: `1px solid ${theme.border}`,
  boxShadow: theme.shadow,
  transition: `all ${theme.transition}`,
  ...(hover ? { cursor: 'pointer' } : {}),
})

export const cardHover: CSSProperties = {
  transform: 'translateY(-4px)',
  boxShadow: `var(--shadow-lg), 0 0 0 1px ${theme.borderHover}`,
  background: theme.bgCardHover,
}

export const glass: CSSProperties = {
  background: 'var(--glass-bg)',
  backdropFilter: 'blur(20px) saturate(1.3)',
  WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
  borderBottom: '1px solid var(--glass-border)',
}

export const inputStyle: CSSProperties = {
  width: '100%',
  padding: '0.7rem 3rem 0.7rem 1rem',
  borderRadius: theme.radiusSm,
  border: `1px solid ${theme.border}`,
  background: theme.bgInput,
  color: theme.text,
  fontSize: '0.9rem',
  outline: 'none',
  transition: `all ${theme.transition}`,
  boxSizing: 'border-box',
}

export const btn = (variant: 'primary' | 'ghost' | 'danger' = 'primary'): CSSProperties => {
  const colors = {
    primary: { bg: 'var(--primary)', color: '#fff', border: 'none', glow: 'var(--primary-glow)' },
    ghost: { bg: 'transparent', color: 'var(--text-secondary)', border: `1px solid var(--border)`, glow: 'none' },
    danger: { bg: 'transparent', color: 'var(--danger)', border: `1px solid var(--danger)`, glow: 'none' },
  }
  const c = colors[variant]
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1.2rem',
    borderRadius: theme.radiusSm,
    background: c.bg,
    color: c.color,
    border: c.border,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.85rem',
    transition: `all ${theme.transition}`,
    boxShadow: c.glow !== 'none' ? `0 4px 14px ${c.glow}` : 'none',
  }
}

export const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

export const glowBg: CSSProperties = {
  position: 'absolute',
  width: 400,
  height: 400,
  borderRadius: '50%',
  filter: 'blur(120px)',
  opacity: 0.12,
  pointerEvents: 'none',
}
