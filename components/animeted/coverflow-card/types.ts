import type { ReactNode } from 'react';

/**
 * One carousel card. All cards share the same size; only the inner content differs.
 * - Background: image URI, or LinearGradient colors, or solid backgroundColor.
 * - Content: optional title, subtitle, and/or icon (ReactNode so you can pass any Lucide icon).
 */
export type CoverFlowCardItem = {
  id: string;
  /** Background: image URL. If set, gradientColors/backgroundColor are ignored. */
  image?: string;
  /** Background: gradient [start, end]. Use when no image. */
  gradientColors?: [string, string];
  /** Background: solid color. Used when no image and no gradientColors. */
  backgroundColor?: string;
  /** Main text (e.g. card title). */
  title?: string;
  /** Secondary text. */
  subtitle?: string;
  /** Icon element (e.g. <Heart color="#fff" size={40} />). */
  icon?: ReactNode;
  /** Optional: custom content instead of title/subtitle/icon. */
  children?: ReactNode;
  textAlign?: 'left' | 'center' | 'right';
  textColor?: string;
  opacity?: number;

};
