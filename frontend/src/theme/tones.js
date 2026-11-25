// Colour "tones" as Tailwind class names, so components pick a tone by name, not by colour.
// Status tones (success / danger) are only for things that MEAN good or bad.
export const TONES = {
  neutral: { chip: 'bg-raised text-body' },
  success: { chip: 'bg-success-subtle text-success-ink' },
  danger: { chip: 'bg-danger-subtle text-danger-ink' },
  // On a solid hero block: translucent white works on black, white and blue fills.
  onHero: { chip: 'bg-current/10' },
}
