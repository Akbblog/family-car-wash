// lib/utils.ts
/**
 * A tiny helper that safely joins Tailwind classes.
 * It removes undefined / null / false values.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}