/**
 * Tests pour le module de modération ChurchFace
 * 
 * Ces tests vérifient que le ModerationService détecte correctement
 * les violations des règles de la communauté.
 */

import { ModerationService, canPublishContent } from '@/lib/moderation/ModerationService';

describe('ModerationService', () => {
  describe('analyseText', () => {
    it('devrait approuver un contenu positif', () => {
      const result = ModerationService.analyzeText(
        'Que Dieu vous bénisse',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('APPROVED');
      expect(result.score).toBe(0);
      expect(result.shouldBlock).toBe(false);
      expect(result.categories).toHaveLength(0);
    });

    it('devrait approuver un contenu positif en français', () => {
      const result = ModerationService.analyzeText(
        'Nous devons nous aimer les uns les autres',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('APPROVED');
      expect(result.score).toBe(0);
      expect(result.shouldBlock).toBe(false);
    });

    it('devrait détecter les grossièretés', () => {
      const result = ModerationService.analyzeText(
        'Cest vraiment de la merde',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('MONITOR');
      expect(result.score).toBeGreaterThan(0);
      expect(result.categories).toContain('PROFANITY');
    });

    it('devrait détecter les insultes', () => {
      const result = ModerationService.analyzeText(
        'Tu es un idiot',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('MONITOR');
      expect(result.score).toBeGreaterThan(0);
      expect(result.categories).toContain('INSULT');
    });

    it('devrait détecter les menaces', () => {
      const result = ModerationService.analyzeText(
        'Je vais te tuer',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('BLOCK');
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.categories).toContain('THREAT');
      expect(result.shouldBlock).toBe(true);
    });

    it('devrait détecter les menaces avec variantes', () => {
      const result = ModerationService.analyzeText(
        'Je vais te faire du mal',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('BLOCK');
      expect(result.categories).toContain('THREAT');
      expect(result.shouldBlock).toBe(true);
    });

    it('devrait détecter le contenu haineux', () => {
      const result = ModerationService.analyzeText(
        'Cest du racisme pur',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('BLOCK');
      expect(result.categories).toContain('HATE');
      expect(result.shouldBlock).toBe(true);
    });

    it('devrait détecter le contenu sexuel', () => {
      const result = ModerationService.analyzeText(
        'Regarde ce contenu porno',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('REVIEW');
      expect(result.categories).toContain('SEXUAL_CONTENT');
      expect(result.requiresReview).toBe(true);
    });

    it('devrait détecter les références à la violence', () => {
      const result = ModerationService.analyzeText(
        'Je vais utiliser une arme',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('REVIEW');
      expect(result.categories).toContain('VIOLENCE');
    });

    it('devrait détecter le harcèlement', () => {
      const result = ModerationService.analyzeText(
        'Arrête pas de me harceler',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('MONITOR');
      expect(result.categories).toContain('HARASSMENT');
    });

    it('devrait détecter les variantes masquées', () => {
      const result = ModerationService.analyzeText(
        'Tu es s@le',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('MONITOR');
      expect(result.categories).toContain('PROFANITY');
    });

    it('devrait détecter les variantes avec chiffres', () => {
      const result = ModerationService.analyzeText(
        'Cest du m3rd3',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('MONITOR');
      expect(result.categories).toContain('PROFANITY');
    });

    it('devrait ajuster le score pour les utilisateurs à risque', () => {
      const result = ModerationService.analyzeText(
        'Cest nul',
        { 
          userId: 'user1', 
          contentType: 'post',
          userHistory: {
            violationCount: 5,
            warningCount: 3,
            trustLevel: 'LOW'
          }
        }
      );

      // Le score devrait être plus élevé pour un utilisateur à risque
      expect(result.score).toBeGreaterThan(0);
    });

    it('devrait réduire le score pour les utilisateurs de confiance', () => {
      const result = ModerationService.analyzeText(
        'Cest nul',
        { 
          userId: 'user1', 
          contentType: 'post',
          userHistory: {
            violationCount: 0,
            warningCount: 0,
            trustLevel: 'HIGH'
          }
        }
      );

      // Le score devrait être réduit pour un utilisateur de confiance
      expect(result.score).toBeLessThan(50);
    });

    it('devrait retourner APPROVED pour un texte vide', () => {
      const result = ModerationService.analyzeText(
        '',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('APPROVED');
      expect(result.score).toBe(0);
    });

    it('devrait retourner APPROVED pour un texte avec seulement des espaces', () => {
      const result = ModerationService.analyzeText(
        '   ',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('APPROVED');
      expect(result.score).toBe(0);
    });
  });

  describe('système de score', () => {
    it('devrait bloquer avec score >= 80', () => {
      const result = ModerationService.analyzeText(
        'Je vais te turer',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('BLOCK');
      expect(result.shouldBlock).toBe(true);
    });

    it('devrait demander review avec score 60-79', () => {
      const result = ModerationService.analyzeText(
        'Regarde ce contenu porno',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('REVIEW');
      expect(result.requiresReview).toBe(true);
    });

    it('devrait monitorer avec score 30-59', () => {
      const result = ModerationService.analyzeText(
        'Cest de la merde',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('MONITOR');
    });

    it('devrait approuver avec score < 30', () => {
      const result = ModerationService.analyzeText(
        'Cest un peu nul',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('APPROVED');
      expect(result.shouldBlock).toBe(false);
    });
  });

  describe('analyseImage', () => {
    it('devrait retourner APPROVED pour les images (placeholder)', async () => {
      const result = await ModerationService.analyzeImage(
        'https://example.com/image.jpg',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('APPROVED');
      expect(result.shouldBlock).toBe(false);
    });
  });

  describe('analyseVideo', () => {
    it('devrait retourner APPROVED pour les vidéos (placeholder)', async () => {
      const result = await ModerationService.analyzeVideo(
        'https://example.com/video.mp4',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('APPROVED');
      expect(result.shouldBlock).toBe(false);
    });
  });

  describe('analyseContent mixte', () => {
    it('devrait bloquer si le texte est bloqué', async () => {
      const result = await ModerationService.analyzeContent(
        { text: 'Je vais te tuer', imageUrl: 'https://example.com/image.jpg' },
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('BLOCK');
      expect(result.shouldBlock).toBe(true);
    });

    it('devrait combiner les catégories de texte et image', async () => {
      const result = await ModerationService.analyzeContent(
        { text: 'Cest de la merde', imageUrl: 'https://example.com/image.jpg' },
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.categories).toContain('PROFANITY');
    });
  });

  describe('canPublishContent', () => {
    it('devrait autoriser un contenu sûr', async () => {
      const result = await canPublishContent(
        { text: 'Que Dieu vous bénisse' },
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.allowed).toBe(true);
      expect(result.result.decision).toBe('APPROVED');
    });

    it('devrait refuser un contenu bloqué', async () => {
      const result = await canPublishContent(
        { text: 'Je vais te tuer' },
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.allowed).toBe(false);
      expect(result.result.decision).toBe('BLOCK');
    });

    it('devrait autoriser un contenu avec score MONITOR', async () => {
      const result = await canPublishContent(
        { text: 'Cest de la merde' },
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.allowed).toBe(true);
      expect(result.result.decision).toBe('MONITOR');
    });

    it('devrait autoriser un contenu avec score REVIEW', async () => {
      const result = await canPublishContent(
        { text: 'Regarde ce contenu porno' },
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.allowed).toBe(true);
      expect(result.result.decision).toBe('REVIEW');
    });
  });
});

describe('Cas dutilisation réels', () => {
  describe('Cas acceptés', () => {
    it('devrait accepter un message de bénédiction', () => {
      const result = ModerationService.analyzeText(
        'Que Dieu vous bénisse',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('APPROVED');
    });

    it('devrait accepter un message damour', () => {
      const result = ModerationService.analyzeText(
        'Nous devons nous aimer',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('APPROVED');
    });

    it('devrait accepter un message de prière', () => {
      const result = ModerationService.analyzeText(
        'Prions pour la paix',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('APPROVED');
    });
  });

  describe('Cas bloqués', () => {
    it('devrait bloquer une menace de mort', () => {
      const result = ModerationService.analyzeText(
        'Je vais te tuer',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('BLOCK');
      expect(result.shouldBlock).toBe(true);
    });

    it('devrait bloquer des insultes graves', () => {
      const result = ModerationService.analyzeText(
        'Tu es un connard',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).not.toBe('APPROVED');
      expect(result.score).toBeGreaterThan(0);
    });

    it('devrait bloquer du contenu sexuel explicite', () => {
      const result = ModerationService.analyzeText(
        'Regarde ce porno',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).not.toBe('APPROVED');
      expect(result.categories).toContain('SEXUAL_CONTENT');
    });
  });

  describe('Absence de faux positifs', () => {
    it('devrait accepter le mot "con" dans un contexte biblique', () => {
      const result = ModerationService.analyzeText(
        'Le Saint-Esprit nous console',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('APPROVED');
    });

    it('devrait accepter le mot "baiser" dans un contexte damitié', () => {
      const result = ModerationService.analyzeText(
        'Je te fais la bise',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('APPROVED');
    });

    it('devrait accepter des discussions normales', () => {
      const result = ModerationService.analyzeText(
        'Comment ça va aujourdhui ?',
        { userId: 'user1', contentType: 'post' }
      );

      expect(result.decision).toBe('APPROVED');
    });
  });
});
