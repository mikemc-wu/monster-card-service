import "dotenv/config";
import * as process from "process";

const dbPassword: string = process.env.DB_PASSWORD;
const dbName: string = process.env.DB_NAME;
const dbSrv: string = process.env.MONGO_SRV;
export const connectionString: string = dbSrv.replace("db_password", dbPassword).replace("db_name", dbName);
export const serviceName = "monster-card-service";
export const port: number = parseInt(process.env.PORT);
export const cardCollection = process.env.DB_CARD_COLLECTION;
