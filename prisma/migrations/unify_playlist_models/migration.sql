-- Migration: unify_playlist_models
-- Étape 1: Ajouter churchId et userId à Playlist
ALTER TABLE "Playlist" ADD COLUMN "churchId" TEXT;
ALTER TABLE "Playlist" ADD COLUMN "userId" TEXT;

-- Étape 2: Rendre playlistId nullable dans PlaylistItem pour compatibilité
ALTER TABLE "PlaylistItem" ALTER COLUMN "playlistId" DROP NOT NULL;

-- Étape 3: Ajouter les index
CREATE INDEX "Playlist_churchId_idx" ON "Playlist"("churchId");
CREATE INDEX "Playlist_userId_idx" ON "Playlist"("userId");

-- Étape 4: Ajouter les contraintes foreign key pour Playlist
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Étape 5: Migrer les données de ChurchPlaylist vers Playlist (si la table existe)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ChurchPlaylist') THEN
        INSERT INTO "Playlist" ("id", "title", "description", "category", "churchId", "createdAt", "updatedAt")
        SELECT 
            "id", 
            "title", 
            "description", 
            "category", 
            "churchId", 
            "createdAt", 
            "updatedAt"
        FROM "ChurchPlaylist"
        ON CONFLICT ("id") DO NOTHING;
    END IF;
END $$;

-- Étape 6: Migrer les données de ChurchPlaylistItem vers PlaylistItem (si la table existe)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ChurchPlaylistItem') THEN
        INSERT INTO "PlaylistItem" ("id", "title", "url", "type", "duration", "order", "playlistId", "createdAt")
        SELECT 
            "id", 
            "title", 
            "url", 
            "type", 
            "duration", 
            "order", 
            "playlistId", 
            "createdAt"
        FROM "ChurchPlaylistItem"
        ON CONFLICT ("id") DO NOTHING;
    END IF;
END $$;

-- Étape 7: Ajouter playlistId à ChurchRadio si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ChurchRadio' AND column_name = 'playlistId'
    ) THEN
        ALTER TABLE "ChurchRadio" ADD COLUMN "playlistId" TEXT;
    END IF;
END $$;

-- Étape 8: Mettre à jour ChurchRadio pour utiliser Playlist au lieu de ChurchPlaylist
-- Changer la contrainte foreign key
ALTER TABLE "ChurchRadio" DROP CONSTRAINT IF EXISTS "ChurchRadio_playlistId_fkey";
ALTER TABLE "ChurchRadio" ADD CONSTRAINT "ChurchRadio_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Étape 9: Supprimer les anciennes tables (après migration des données)
DROP TABLE IF EXISTS "ChurchPlaylistItem" CASCADE;
DROP TABLE IF EXISTS "ChurchPlaylist" CASCADE;