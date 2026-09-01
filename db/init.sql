-- niulai — database init (schema + seed).
-- Run ONCE in the Supabase SQL Editor on a fresh project database.
-- Idempotent-ish: tables/indexes use IF NOT EXISTS; seed uses ON CONFLICT DO NOTHING,
-- so re-running the seed part is safe. FK constraints assume a fresh DB (drop tables first
-- to reset — see bottom).
--
-- After running this, set DATABASE_URL (pooler, port 6543, pgbouncer) and DIRECT_URL
-- (port 5432) in Vercel env vars; the app queries these tables via Prisma at runtime.

-- ===== schema =====

CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "Role" AS ENUM ('READER', 'AUTHOR', 'ADMIN');
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'READER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "authorId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Topic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Reply" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Reply_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Post_slug_key" ON "Post"("slug");
CREATE INDEX IF NOT EXISTS "Post_status_publishedAt_idx" ON "Post"("status", "publishedAt" DESC);
CREATE INDEX IF NOT EXISTS "Comment_postId_createdAt_idx" ON "Comment"("postId", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "Topic_slug_key" ON "Topic"("slug");
CREATE INDEX IF NOT EXISTS "Topic_createdAt_idx" ON "Topic"("createdAt");
CREATE INDEX IF NOT EXISTS "Reply_topicId_createdAt_idx" ON "Reply"("topicId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "Post"    ADD CONSTRAINT "Post_authorId_fkey"    FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey"   FOREIGN KEY ("postId")   REFERENCES "Post"("id")  ON DELETE CASCADE  ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Topic"  ADD CONSTRAINT "Topic_authorId_fkey"   FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Reply"  ADD CONSTRAINT "Reply_topicId_fkey"   FOREIGN KEY ("topicId")  REFERENCES "Topic"("id") ON DELETE CASCADE  ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Reply"  ADD CONSTRAINT "Reply_authorId_fkey"  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ===== seed (idempotent) =====

INSERT INTO "User" ("id","email","name","role","createdAt","updatedAt")
VALUES ('user-owner','owner@niulai.local','Site Owner','ADMIN', now(), now())
ON CONFLICT (id) DO NOTHING;

-- The "other user" behind the visitor view (lib/auth.ts). READER: can
-- comment/reply as someone else, owns nothing, cannot author posts.
INSERT INTO "User" ("id","email","name","role","createdAt","updatedAt")
VALUES ('user-guest','guest@niulai.local','Visitor','READER', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Post" ("id","title","slug","content","excerpt","status","authorId","publishedAt","createdAt","updatedAt") VALUES
  ('post-hello-world','Hello, world','hello-world',
   '# Hello\n\nThis is the first post. Content over decoration.',
   'The first post.','PUBLISHED','user-owner', now() - interval '3 days', now() - interval '3 days', now() - interval '3 days'),
  ('post-unix-philosophy','Why a Unix philosophy','why-unix-philosophy',
   '# Why Unix philosophy\n\nSmall, composable, boring. The site should feel like a tool.',
   'On the project''s guiding principles.','PUBLISHED','user-owner', now() - interval '1 day', now() - interval '1 day', now() - interval '1 day'),
  ('post-draft-notes','Draft notes','draft-notes',
   '# Draft\n\nNot published yet. Should not appear in the blog list.',
   NULL,'DRAFT','user-owner', NULL, now(), now())
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Comment" ("id","content","postId","authorId","createdAt","updatedAt") VALUES
  ('comment-1','Nice first post. Looking forward to more.','post-hello-world','user-owner', now() - interval '2 days', now() - interval '2 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Topic" ("id","title","slug","content","authorId","createdAt","updatedAt") VALUES
  ('topic-welcome','Welcome to the forum','welcome',
   'A small forum. Keep it on topic, keep it kind.','user-owner', now() - interval '2 days', now() - interval '2 days'),
  ('topic-cli-tools','Favorite CLI tools','favorite-cli-tools',
   'What terminal tools do you reach for daily?','user-owner', now() - interval '12 hours', now() - interval '12 hours')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "Reply" ("id","content","topicId","authorId","createdAt","updatedAt") VALUES
  ('reply-1','Glad to be here.','topic-welcome','user-owner', now() - interval '1 day', now() - interval '1 day'),
  ('reply-2','`rg`, `fd`, `jq` — the essentials.','topic-cli-tools','user-owner', now() - interval '6 hours', now() - interval '6 hours')
ON CONFLICT (id) DO NOTHING;

-- ===== reset (run manually if you need a clean slate) =====
-- DROP TABLE IF EXISTS "Reply","Comment","Topic","Post","User" CASCADE;
-- DROP TYPE IF EXISTS "PostStatus","Role";
