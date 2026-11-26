// Colour "tones" as Tailwind class names, so components pick a tone by name, not by colour.
// Status tones (success / danger) are only for things that MEAN good or bad.
export const TONES = {
  neutral: { chip: 'bg-raised text-body' },
  success: { chip: 'bg-success-subtle text-success-ink' },
  danger: { chip: 'bg-danger-subtle text-danger-ink' },
  // On a gradient hero block: translucent white works on dark and violet fills.
  onHero: { chip: 'bg-white/15 backdrop-blur-sm' },
}

