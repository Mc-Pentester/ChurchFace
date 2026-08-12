/**
 * ModerationService - Service d'analyse de contenu pour ChurchFace
 * 
 * Ce service analyse automatiquement le contenu (texte, images, vidéos)
 * avant sa publication pour détecter les violations des règles de la communauté.
 * 
 * Compatible avec l'intégration future d'IA pour une analyse plus avancée.
 */

export type ModerationDecision = 'APPROVED' | 'MONITOR' | 'REVIEW' | 'BLOCK';
export type ModerationCategory = 'INSULT' | 'PROFANITY' | 'SEXUAL_CONTENT' | 'PORNOGRAPHY' | 'VIOLENCE' | 'THREAT' | 'HATE' | 'HARASSMENT' | 'SPAM' | 'OTHER';

export interface ModerationResult {
  decision: ModerationDecision;
  score: number; // 0-100
  categories: ModerationCategory[];
  reasons: string[];
  shouldBlock: boolean;
  requiresReview: boolean;
}

export interface ModerationContext {
  userId: string;
  userHistory?: UserModerationHistory;
  contentType: 'post' | 'comment' | 'message' | 'story';
}

export interface UserModerationHistory {
  violationCount: number;
  warningCount: number;
  lastViolationAt?: Date;
  trustLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Listes de mots et patterns pour l'analyse de texte
 * Ces listes peuvent être étendues ou remplacées par une IA à l'avenir
 */
const PROFANITY_WORDS = [
  'merde', 'putain', 'con', 'connard', 'salope', 'enculé', 'putain',
  'bordel', 'chier', 'foutre', 'cul', 'bite', 'couille', 'nichon',
  'enfoiré', 'enculée', 'salaud', 'connasse', 'putain', 'merdeux',
  // Variants anglais
  'shit', 'fuck', 'damn', 'ass', 'bastard', 'bitch', 'crap',
];

const INSULT_WORDS = [
  'idiot', 'stupide', 'imbécile', 'crétin', 'abruti', 'débile',
  'nul', 'loser', 'faible', 'lâche', 'traître', 'hypocrite',
  'menteur', 'voleur', 'escroc', 'arnaqueur',
];

const THREAT_PATTERNS = [
  /je (vais|vais te|te vais|vais de).*(tuer|faire du mal|battre|détruire|éliminer|nuire)/i,
  /je (te|vais te).*(regret|tuer|mourir|disparaître)/i,
  /tu (vas|vas mourir|vas crever|vas regretter)/i,
  /(attention|gare|méfiance).*(moi|toi)/i,
];

const HARASSMENT_PATTERNS = [
  /arrête.*pas/i,
  /laisse.*moi.*tranquille/i,
  /cesser.*ce.*comportement/i,
  /harceler|harcèlement/i,
];

const SEXUAL_CONTENT_WORDS = [
  'porn', 'porno', 'xvideos', 'pornhub', 'sexe', 'sex', 'nu', 'nue',
  'nudité', 'érotique', 'adulte', 'xxx', 'hard', 'soft',
];

const VIOLENCE_WORDS = [
  'tuer', 'meurtre', 'assassinat', 'violence', 'agression', 'battre',
  'frapper', 'couper', 'blessure', 'arme', 'gun', 'knife', 'couteau',
];

const HATE_PATTERNS = [
  /raciste?/i,
  /antisémite?/i,
  /homophobe?/i,
  /xénophobe?/i,
  /discrimination/i,
  /haine.*contre/i,
];

/**
 * Masques de caractères courants pour contourner les filtres
 */
const MASKED_PATTERNS = [
  /[s$5][@a4][l1][e3]/gi, // s@le, s4le, s1e, s3e
  /[c$][0o][n][n@][4a][r][d]/gi, // c0nn@rd
  /[p][u][t][@][a][1][n]/gi, // put@1n
  /[m][e3][r][d][1][e3]/gi, // m3rd13
  /[f][u][c$][k]/gi, // f$ck
  /[s][h][1][t]/gi, // sh1t
  /[b][1][t][c][h]/gi, // b1tch
  /[a][s][s][0o][l3]/gi, // a$$o13
];

/**
 * Service de modération
 */
export class ModerationService {
  /**
   * Analyser un texte et retourner un résultat de modération
   */
  static analyzeText(text: string, context: ModerationContext): ModerationResult {
    if (!text || text.trim().length === 0) {
      return this.createSafeResult();
    }

    const lowerText = text.toLowerCase();
    const categories: ModerationCategory[] = [];
    const reasons: string[] = [];
    let score = 0;

    // 1. Détection des menaces (score élevé)
    if (this.detectThreats(lowerText)) {
      categories.push('THREAT');
      reasons.push('Détection de menace potentielle');
      score += 80;
    }

    // 2. Détection de haine (score élevé)
    if (this.detectHate(lowerText)) {
      categories.push('HATE');
      reasons.push('Contenu haineux détecté');
      score += 70;
    }

    // 3. Détection de contenu sexuel (score élevé)
    if (this.detectSexualContent(lowerText)) {
      categories.push('SEXUAL_CONTENT');
      reasons.push('Contenu sexuel détecté');
      score += 60;
    }

    // 4. Détection de violence (score moyen-élevé)
    if (this.detectViolence(lowerText)) {
      categories.push('VIOLENCE');
      reasons.push('Référence à la violence détectée');
      score += 50;
    }

    // 5. Détection d'insultes (score moyen)
    if (this.detectInsults(lowerText)) {
      categories.push('INSULT');
      reasons.push('Insultes détectées');
      score += 40;
    }

    // 6. Détection de grossièretés (score faible-moyen)
    if (this.detectProfanity(lowerText)) {
      categories.push('PROFANITY');
      reasons.push('Grossièretés détectées');
      score += 25;
    }

    // 7. Détection de harcèlement (score moyen)
    if (this.detectHarassment(lowerText)) {
      categories.push('HARASSMENT');
      reasons.push('Comportement de harcèlement détecté');
      score += 45;
    }

    // 8. Détection de variantes masquées (score moyen)
    if (this.detectMaskedWords(lowerText)) {
      categories.push('PROFANITY');
      reasons.push('Variantes masquées détectées');
      score += 30;
    }

    // 9. Ajustement du score basé sur l'historique utilisateur
    const adjustedScore = this.adjustScoreByHistory(score, context.userHistory);

    // 10. Détermination de la décision
    const decision = this.determineDecision(adjustedScore, categories);

    return {
      decision,
      score: adjustedScore,
      categories,
      reasons,
      shouldBlock: decision === 'BLOCK',
      requiresReview: decision === 'REVIEW' || decision === 'MONITOR',
    };
  }

  /**
   * Analyser une image (interface pour intégration IA future)
   */
  static async analyzeImage(_imageUrl: string, _context: ModerationContext): Promise<ModerationResult> {
    // Pour l'instant, retourne APPROVED
    // À l'avenir, intégrer avec un service IA (ex: AWS Rekognition, Google Vision API)
    
    return this.createSafeResult();
  }

  /**
   * Analyser une vidéo (interface pour intégration IA future)
   */
  static async analyzeVideo(_videoUrl: string, _context: ModerationContext): Promise<ModerationResult> {
    // Pour l'instant, retourne APPROVED
    // À l'avenir, intégrer avec un service IA pour extraction de frames et analyse
    
    return this.createSafeResult();
  }

  /**
   * Analyser du contenu mixte (texte + images + vidéos)
   */
  static async analyzeContent(
    content: { text?: string; imageUrl?: string; videoUrl?: string },
    context: ModerationContext
  ): Promise<ModerationResult> {
    const textResult = content.text ? this.analyzeText(content.text, context) : this.createSafeResult();
    
    // Si le texte est déjà bloqué, retourner immédiatement
    if (textResult.decision === 'BLOCK') {
      return textResult;
    }

    let maxScore = textResult.score;
    let allCategories = [...textResult.categories];
    let allReasons = [...textResult.reasons];

    // Analyser l'image si présente
    if (content.imageUrl) {
      const imageResult = await this.analyzeImage(content.imageUrl, context);
      maxScore = Math.max(maxScore, imageResult.score);
      allCategories = [...allCategories, ...imageResult.categories];
      allReasons = [...allReasons, ...imageResult.reasons];
    }

    // Analyser la vidéo si présente
    if (content.videoUrl) {
      const videoResult = await this.analyzeVideo(content.videoUrl, context);
      maxScore = Math.max(maxScore, videoResult.score);
      allCategories = [...allCategories, ...videoResult.categories];
      allReasons = [...allReasons, ...videoResult.reasons];
    }

    const decision = this.determineDecision(maxScore, allCategories);

    return {
      decision,
      score: maxScore,
      categories: allCategories,
      reasons: allReasons,
      shouldBlock: decision === 'BLOCK',
      requiresReview: decision === 'REVIEW' || decision === 'MONITOR',
    };
  }

  // ===== Méthodes de détection privées =====

  private static detectProfanity(text: string): boolean {
    return PROFANITY_WORDS.some(word => text.includes(word));
  }

  private static detectInsults(text: string): boolean {
    return INSULT_WORDS.some(word => text.includes(word));
  }

  private static detectThreats(text: string): boolean {
    return THREAT_PATTERNS.some(pattern => pattern.test(text));
  }

  private static detectHarassment(text: string): boolean {
    return HARASSMENT_PATTERNS.some(pattern => pattern.test(text));
  }

  private static detectSexualContent(text: string): boolean {
    return SEXUAL_CONTENT_WORDS.some(word => text.includes(word));
  }

  private static detectViolence(text: string): boolean {
    return VIOLENCE_WORDS.some(word => text.includes(word));
  }

  private static detectHate(text: string): boolean {
    return HATE_PATTERNS.some(pattern => pattern.test(text));
  }

  private static detectMaskedWords(text: string): boolean {
    return MASKED_PATTERNS.some(pattern => pattern.test(text));
  }

  private static adjustScoreByHistory(score: number, history?: UserModerationHistory): number {
    if (!history) return score;

    // Ajustement basé sur le niveau de confiance
    switch (history.trustLevel) {
      case 'LOW':
        return score + 20; // Utilisateurs à risque : score augmenté
      case 'HIGH':
        return score - 10; // Utilisateurs de confiance : score réduit
      default:
        return score;
    }
  }

  private static determineDecision(score: number, categories: ModerationCategory[]): ModerationDecision {
    // Catégories critiques qui bloquent automatiquement
    const criticalCategories: ModerationCategory[] = ['THREAT', 'HATE', 'PORNOGRAPHY'];
    const hasCriticalCategory = categories.some(cat => criticalCategories.includes(cat));

    if (hasCriticalCategory) {
      return 'BLOCK';
    }

    // Score-based decision
    if (score >= 80) return 'BLOCK';
    if (score >= 60) return 'REVIEW';
    if (score >= 30) return 'MONITOR';
    return 'APPROVED';
  }

  private static createSafeResult(): ModerationResult {
    return {
      decision: 'APPROVED',
      score: 0,
      categories: [],
      reasons: [],
      shouldBlock: false,
      requiresReview: false,
    };
  }
}

/**
 * Fonction utilitaire pour vérifier si le contenu peut être publié
 */
export async function canPublishContent(
  content: { text?: string; imageUrl?: string; videoUrl?: string },
  context: ModerationContext
): Promise<{ allowed: boolean; result: ModerationResult }> {
  const result = await ModerationService.analyzeContent(content, context);
  return {
    allowed: result.decision !== 'BLOCK',
    result,
  };
}
