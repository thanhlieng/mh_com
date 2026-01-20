import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource, DataSourceOptions } from "typeorm";
import { databaseConfig, nodeEnvConfig } from "../configs.constants";

export const typeOrmConfig: TypeOrmModule = {
  host: databaseConfig.host,
  port: databaseConfig.port,
  username: databaseConfig.username,
  password: databaseConfig.password,
  database: databaseConfig.database,
  entities: [`${__dirname}/../../**/*.entity.{js,ts}`],
  synchronize: databaseConfig.synchronize,
  logging: databaseConfig.logging === "true",
  ssl:
    nodeEnvConfig !== "local"
      ? {
          rejectUnauthorized: false,
        }
      : null,
};

export const dataSource = new DataSource({
  ...typeOrmConfig,
  type: "postgres",
  migrations: ["dist/**/*/migrations/*{.ts,.js}"],
} as DataSourceOptions);
