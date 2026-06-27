import { MigrationInterface, QueryRunner } from "typeorm";

export class AddASupplierIdToUsers1748505600001 implements MigrationInterface {
    name = 'AddASupplierIdToUsers1748505600001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "a_supplier_id" character varying NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_a_supplier_id" ON "users" ("a_supplier_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_a_supplier_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "a_supplier_id"`);
    }
}
