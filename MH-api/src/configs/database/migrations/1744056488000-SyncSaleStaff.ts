import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
} from "typeorm";
export class SyncSaleStaff1744056488000 implements MigrationInterface {
  name = "SyncSaleStaff1744056488000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE pu_deliveries pd 
      SET sales_staff_id = (
          SELECT ms.staff_id  
          FROM booking b 
          INNER JOIN customers c ON c.id = b.customer_id 
          INNER JOIN management_staff ms ON ms.customer_id = c.id 
          WHERE b.id = pd.booking_id AND ms.type_staff = 'CODE_OPENING_STAFF'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }
}
