import "reflect-metadata";
import express from 'express';
import dotenv from 'dotenv';
import { AppDataSource } from "./config/data-source";

dotenv.config();
const app = express();

AppDataSource.initialize()
    .then(() => {
        console.log("Database has been initialized!");
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });

app.get('/', (req, res) => res.send('API Multi-Role Ready!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));