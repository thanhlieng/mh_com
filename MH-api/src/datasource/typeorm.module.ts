import { Global, Module } from "@nestjs/common";
import { databaseConfig } from "src/configs/configs.constants";
import { dataSource } from "src/configs/database/typeorm.config";
import { DataSource } from "typeorm";

@Global() // makes the module available globally for other modules once imported in the app modules
@Module({
  imports: [],
  providers: [
    {
      provide: DataSource, // add the datasource as a provider
      inject: [],
      useFactory: async () => {
        // using the factory function to create the datasource instance
        try {
          console.log("????? ", databaseConfig.username);
          console.log("?????123456 ", databaseConfig);

          await dataSource.initialize(); // initialize the data source
          console.log("Database connected successfully");

          return dataSource;
        } catch (error) {
          console.log("Error connecting to database");
          throw error;
        }
      },
    },
  ],
  exports: [DataSource],
})
export class TypeOrmModule {}
