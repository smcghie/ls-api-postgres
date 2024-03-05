import { MigrationInterface, QueryRunner } from "typeorm";

export class FirstMigration1707810933788 implements MigrationInterface {
    name = 'FirstMigration1707810933788'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "friendship" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "friendId" uuid NOT NULL, CONSTRAINT "PK_dbd6fb568cd912c5140307075cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "momentId" uuid NOT NULL, "commentText" text NOT NULL, "userId" uuid, "parentId" uuid, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "friend_request" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "senderId" uuid, "receiverId" uuid, CONSTRAINT "PK_4c9d23ff394888750cf66cac17c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."report_status_enum" AS ENUM('pending', 'reviewing', 'resolved', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "report" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."report_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "reportedUserId" uuid, "reportingUserId" uuid, "reportedMomentId" uuid, CONSTRAINT "PK_99e4d0bea58cba73c57f935a546" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userType" character varying NOT NULL DEFAULT 'regular', "avatar" character varying, "username" character varying NOT NULL, "name" character varying NOT NULL, "isPrivate" boolean NOT NULL DEFAULT false, "email" character varying NOT NULL, "password" character varying NOT NULL, "albumCount" integer NOT NULL DEFAULT '0', "totalDataUsed" numeric(6,1) NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "lastLogin" TIMESTAMP, "previousLogin" TIMESTAMP, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
        await queryRunner.query(`CREATE TABLE "album" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "albumType" character varying NOT NULL, "createdById" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_58e0b4b8a31bb897e6959fe3206" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "moment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "image" character varying NOT NULL, "description" text NOT NULL, "coordinates" double precision array NOT NULL, "commentCount" integer NOT NULL, "captureDate" character varying NOT NULL, "albumId" uuid NOT NULL, "fileSize" numeric(5,1) NOT NULL DEFAULT '0', "fileType" character varying NOT NULL DEFAULT '', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdById" uuid, CONSTRAINT "PK_12b5f241c827142ad0659cb8262" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "album_shared_users" ("albumId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_b82c58a0cdb9a12dc6abb56fc35" PRIMARY KEY ("albumId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bc1b2b0473a431f0ab2fd831e1" ON "album_shared_users" ("albumId") `);
        await queryRunner.query(`CREATE INDEX "IDX_cf1f3aa6127f49d8df5f5aa165" ON "album_shared_users" ("userId") `);
        await queryRunner.query(`ALTER TABLE "friendship" ADD CONSTRAINT "FK_303e50cd29767b99cc55ab45c12" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friendship" ADD CONSTRAINT "FK_9372d39ed9833c770cb6d2c5cd1" FOREIGN KEY ("friendId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_8470e3afc35744323b5285e8892" FOREIGN KEY ("momentId") REFERENCES "moment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_e3aebe2bd1c53467a07109be596" FOREIGN KEY ("parentId") REFERENCES "comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friend_request" ADD CONSTRAINT "FK_9509b72f50f495668bae3c0171c" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friend_request" ADD CONSTRAINT "FK_470e723fdad9d6f4981ab2481eb" FOREIGN KEY ("receiverId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "report" ADD CONSTRAINT "FK_9bcc42f31a07ba2ec734bfa7dd0" FOREIGN KEY ("reportedUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "report" ADD CONSTRAINT "FK_8fc3146206e9f18ac25fba037dc" FOREIGN KEY ("reportingUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "report" ADD CONSTRAINT "FK_dd52c79056bff7e098380e3abaa" FOREIGN KEY ("reportedMomentId") REFERENCES "moment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "album" ADD CONSTRAINT "FK_3639d0cd1c6ca5a58205f391887" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "moment" ADD CONSTRAINT "FK_18810d5e1505bc418af3f714714" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "moment" ADD CONSTRAINT "FK_bdb84a2034a39c383d6919babcd" FOREIGN KEY ("albumId") REFERENCES "album"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "album_shared_users" ADD CONSTRAINT "FK_bc1b2b0473a431f0ab2fd831e1f" FOREIGN KEY ("albumId") REFERENCES "album"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "album_shared_users" ADD CONSTRAINT "FK_cf1f3aa6127f49d8df5f5aa1651" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "album_shared_users" DROP CONSTRAINT "FK_cf1f3aa6127f49d8df5f5aa1651"`);
        await queryRunner.query(`ALTER TABLE "album_shared_users" DROP CONSTRAINT "FK_bc1b2b0473a431f0ab2fd831e1f"`);
        await queryRunner.query(`ALTER TABLE "moment" DROP CONSTRAINT "FK_bdb84a2034a39c383d6919babcd"`);
        await queryRunner.query(`ALTER TABLE "moment" DROP CONSTRAINT "FK_18810d5e1505bc418af3f714714"`);
        await queryRunner.query(`ALTER TABLE "album" DROP CONSTRAINT "FK_3639d0cd1c6ca5a58205f391887"`);
        await queryRunner.query(`ALTER TABLE "report" DROP CONSTRAINT "FK_dd52c79056bff7e098380e3abaa"`);
        await queryRunner.query(`ALTER TABLE "report" DROP CONSTRAINT "FK_8fc3146206e9f18ac25fba037dc"`);
        await queryRunner.query(`ALTER TABLE "report" DROP CONSTRAINT "FK_9bcc42f31a07ba2ec734bfa7dd0"`);
        await queryRunner.query(`ALTER TABLE "friend_request" DROP CONSTRAINT "FK_470e723fdad9d6f4981ab2481eb"`);
        await queryRunner.query(`ALTER TABLE "friend_request" DROP CONSTRAINT "FK_9509b72f50f495668bae3c0171c"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_e3aebe2bd1c53467a07109be596"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_8470e3afc35744323b5285e8892"`);
        await queryRunner.query(`ALTER TABLE "friendship" DROP CONSTRAINT "FK_9372d39ed9833c770cb6d2c5cd1"`);
        await queryRunner.query(`ALTER TABLE "friendship" DROP CONSTRAINT "FK_303e50cd29767b99cc55ab45c12"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cf1f3aa6127f49d8df5f5aa165"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bc1b2b0473a431f0ab2fd831e1"`);
        await queryRunner.query(`DROP TABLE "album_shared_users"`);
        await queryRunner.query(`DROP TABLE "moment"`);
        await queryRunner.query(`DROP TABLE "album"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "report"`);
        await queryRunner.query(`DROP TYPE "public"."report_status_enum"`);
        await queryRunner.query(`DROP TABLE "friend_request"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP TABLE "friendship"`);
    }

}
