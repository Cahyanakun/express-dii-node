import { DataSource } from "typeorm";
import { User } from "../models/User";
import { Role } from "../models/Role";
import { Menu } from "../models/Menu";
import * as dotenv from "dotenv";

dotenv.config(); // Load isi file .env

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true, // Auto-create table pas development
    logging: false,
    entities: [User, Role, Menu],
});