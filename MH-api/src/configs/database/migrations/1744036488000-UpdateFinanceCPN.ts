import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
} from "typeorm";

export class UpdateFinanceCPN1744036488000 implements MigrationInterface {
  name = "UpdateFinanceCPN1744036488000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("finance_cpn", [
      new TableColumn({
        name: "price_list_type",
        type: "varchar",
        isNullable: true,
      }),
      new TableColumn({
        name: "export_form",
        type: "varchar",
        isNullable: true,
      }),
      new TableColumn({
        name: "op_billable_weight",
        type: 'numeric',
        isNullable: true,
      }),
      new TableColumn({
        name: "partner_billable_weight",
        type: 'numeric',
        isNullable: true,
      }),
      new TableColumn({
        name: "ncc_pp",
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: "ncc_co",
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: "ncc_handling",
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: "original_revenue_before_diff",
        type: 'numeric',
        isNullable: true,
      }),
      new TableColumn({
        name: "price_diff",
        type: 'numeric',
        isNullable: true,
      }),
      new TableColumn({
        name: "cost_of_main_ncc",
        type: 'numeric',
        isNullable: true,
      }),
      new TableColumn({
        name: "total_cost_capital_main_type_ncc",
        type: 'numeric',
        isNullable: true,
      }),
      new TableColumn({
        name: "type_invoice_of_main_ncc",
        type: 'varchar',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "finance_cpn" DROP COLUMN "price_list_type";
      ALTER TABLE "finance_cpn" DROP COLUMN "export_form";
      ALTER TABLE "finance_cpn" DROP COLUMN "op_billable_weight";
      ALTER TABLE "finance_cpn" DROP COLUMN "partner_billable_weight";
      ALTER TABLE "finance_cpn" DROP COLUMN "ncc_pp";
      ALTER TABLE "finance_cpn" DROP COLUMN "ncc_handling";
      ALTER TABLE "finance_cpn" DROP COLUMN "ncc_co";
      ALTER TABLE "finance_cpn" DROP COLUMN "original_revenue_before_diff";
      ALTER TABLE "finance_cpn" DROP COLUMN "price_diff";
      ALTER TABLE "finance_cpn" DROP COLUMN "cost_of_main_ncc";
      ALTER TABLE "finance_cpn" DROP COLUMN "total_cost_capital_main_type_ncc";
      ALTER TABLE "finance_cpn" DROP COLUMN "type_invoice_of_main_ncc";
    `);
  }
}
