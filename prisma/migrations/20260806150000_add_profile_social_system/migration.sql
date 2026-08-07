-- Add Profile Social System
-- This migration adds the complete social profile infrastructure
-- including privacy settings, media galleries, and blocking system

DO $$
BEGIN
    -- ============================================
    -- USER TABLE EXTENSIONS
    -- ============================================
    
    -- Add cover image
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'User' AND column_name = 'coverImage'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "coverImage" TEXT;
    END IF;
    
    -- Add first name
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'User' AND column_name = 'firstName'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "firstName" TEXT;
    END IF;
    
    -- Add last name
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'User' AND column_name = 'lastName'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "lastName" TEXT;
    END IF;
    
    -- Add country
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'User' AND column_name = 'country'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "country" TEXT;
    END IF;
    
    -- Add language with default
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'User' AND column_name = 'language'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "language" TEXT DEFAULT 'fr';
    END IF;
    
    -- Add ministry
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'User' AND column_name = 'ministry'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "ministry" TEXT;
    END IF;
    
    -- Add username with unique constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'User' AND column_name = 'username'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "username" TEXT;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE tablename = 'User' AND indexname = 'User_username_key'
        ) THEN
            CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
        END IF;
    END IF;
    
    -- ============================================
    -- PROFILE PRIVACY TABLE
    -- ============================================
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'ProfilePrivacy'
    ) THEN
        CREATE TABLE "ProfilePrivacy" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "profileLocked" BOOLEAN NOT NULL DEFAULT false,
            "postVisibility" TEXT NOT NULL DEFAULT 'PUBLIC',
            "friendVisibility" TEXT NOT NULL DEFAULT 'PUBLIC',
            "followPermission" TEXT NOT NULL DEFAULT 'EVERYONE',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            
            CONSTRAINT "ProfilePrivacy_pkey" PRIMARY KEY ("id")
        );
        
        -- Create unique index on userId
        CREATE UNIQUE INDEX "ProfilePrivacy_userId_key" ON "ProfilePrivacy"("userId");
        
        -- Create index on userId
        CREATE INDEX "ProfilePrivacy_userId_idx" ON "ProfilePrivacy"("userId");
        
        -- Add foreign key to User
        ALTER TABLE "ProfilePrivacy"
        ADD CONSTRAINT "ProfilePrivacy_userId_fkey"
        FOREIGN KEY ("userId")
        REFERENCES "User"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    END IF;
    
    -- ============================================
    -- ALBUM TABLE
    -- ============================================
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'Album'
    ) THEN
        CREATE TABLE "Album" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "type" TEXT NOT NULL DEFAULT 'CUSTOM',
            "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            
            CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
        );
        
        -- Create indexes
        CREATE INDEX "Album_userId_idx" ON "Album"("userId");
        CREATE INDEX "Album_type_idx" ON "Album"("type");
        CREATE INDEX "Album_visibility_idx" ON "Album"("visibility");
        
        -- Add foreign key to User
        ALTER TABLE "Album"
        ADD CONSTRAINT "Album_userId_fkey"
        FOREIGN KEY ("userId")
        REFERENCES "User"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    END IF;
    
    -- ============================================
    -- MEDIA TABLE
    -- ============================================
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'Media'
    ) THEN
        CREATE TABLE "Media" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "albumId" TEXT,
            "type" TEXT NOT NULL,
            "url" TEXT NOT NULL,
            "thumbnail" TEXT,
            "caption" TEXT,
            "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            
            CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
        );
        
        -- Create indexes
        CREATE INDEX "Media_userId_idx" ON "Media"("userId");
        CREATE INDEX "Media_albumId_idx" ON "Media"("albumId");
        CREATE INDEX "Media_type_idx" ON "Media"("type");
        CREATE INDEX "Media_visibility_idx" ON "Media"("visibility");
        CREATE INDEX "Media_createdAt_idx" ON "Media"("createdAt");
        
        -- Add foreign key to User
        ALTER TABLE "Media"
        ADD CONSTRAINT "Media_userId_fkey"
        FOREIGN KEY ("userId")
        REFERENCES "User"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
        
        -- Add foreign key to Album
        ALTER TABLE "Media"
        ADD CONSTRAINT "Media_albumId_fkey"
        FOREIGN KEY ("albumId")
        REFERENCES "Album"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE;
    END IF;
    
    -- ============================================
    -- BLOCK TABLE
    -- ============================================
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'Block'
    ) THEN
        CREATE TABLE "Block" (
            "id" TEXT NOT NULL,
            "blockerId" TEXT NOT NULL,
            "blockedId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            
            CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
        );
        
        -- Create unique index on blockerId + blockedId
        CREATE UNIQUE INDEX "Block_blockerId_blockedId_key" ON "Block"("blockerId", "blockedId");
        
        -- Create indexes
        CREATE INDEX "Block_blockerId_idx" ON "Block"("blockerId");
        CREATE INDEX "Block_blockedId_idx" ON "Block"("blockedId");
        
        -- Add foreign key to User (blocker)
        ALTER TABLE "Block"
        ADD CONSTRAINT "Block_blockerId_fkey"
        FOREIGN KEY ("blockerId")
        REFERENCES "User"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
        
        -- Add foreign key to User (blocked)
        ALTER TABLE "Block"
        ADD CONSTRAINT "Block_blockedId_fkey"
        FOREIGN KEY ("blockedId")
        REFERENCES "User"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    END IF;
    
END $$;
