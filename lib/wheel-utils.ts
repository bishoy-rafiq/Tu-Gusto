// Shared logic for drawing wheel prize labels.
//
// Labels are drawn radially: each one runs along its slice's radius so the
// text reads from the outer edge toward the hub (the top slice reads from up
// to down). The rotation is adjusted so letters are never upside down, and the
// font size is fitted to the radial space available for the label.

export function radialTextRotation(midAngleDeg: number): number {
  let rot = midAngleDeg + 90;
  const rad = (rot * Math.PI) / 180;
  if (Math.cos(rad) < 0) rot += 180;
  return rot;
}

export function fitRadialFont(
  label: string,
  textR: number,
  radius: number,
  centerClearance: number,
  maxFont = 13,
  minFont = 8
): number {
  const inner = textR - centerClearance;
  const outer = radius - textR;
  const budget = Math.max(0, Math.min(inner, outer));
  const pxPerChar = 0.6;
  const font = Math.floor((2 * budget) / (label.length * pxPerChar));
  return Math.max(minFont, Math.min(maxFont, font));
}
