// The one button used across the app (Shopify Polaris Button; styles in theme/buttons.css).
// variant: 'primary' (navy, main action) | 'secondary' (white, everyday) | 'ghost' (Polaris tertiary)
// size: 'md' (28px) | 'sm' (24px). icon: true for a square icon-only button (give it an aria-label).
export default function Button({ variant = 'secondary', size = 'md', icon = false, className = '', type = 'button', ...props }) {
  const classes = ['btn', `btn-${variant}`, size === 'sm' ? 'btn-sm' : '', icon ? 'btn-icon' : '', className]
    .filter(Boolean)
    .join(' ')
  return <button type={type} className={classes} {...props} />
}
