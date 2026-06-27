import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCustomerIdToUsers1749300000000 implements MigrationInterface {
  name = 'AddCustomerIdToUsers1749300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'a_customer_id',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'a_customer_id');
  }
}
