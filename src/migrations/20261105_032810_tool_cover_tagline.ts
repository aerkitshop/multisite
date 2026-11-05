import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tools" ADD COLUMN "tagline" varchar;
  ALTER TABLE "tools" ADD COLUMN "best_for" varchar;
  ALTER TABLE "tools" ADD COLUMN "starting_price" varchar;
  ALTER TABLE "tools" ADD COLUMN "cover_id" integer;
  ALTER TABLE "tools" ADD CONSTRAINT "tools_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "tools_cover_idx" ON "tools" USING btree ("cover_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tools" DROP CONSTRAINT "tools_cover_id_media_id_fk";
  
  DROP INDEX "tools_cover_idx";
  ALTER TABLE "tools" DROP COLUMN "tagline";
  ALTER TABLE "tools" DROP COLUMN "best_for";
  ALTER TABLE "tools" DROP COLUMN "starting_price";
  ALTER TABLE "tools" DROP COLUMN "cover_id";`)
}
