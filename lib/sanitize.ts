/**
 * Nettoie le texte brut en supprimant les balises HTML.
 */
export function sanitizeText(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}