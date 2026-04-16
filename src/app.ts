import "reflect-metadata";
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import { AppDataSource } from "./config/data-source";
import authRoutes from "./routes/authRoutes";
import menuRoutes from "./routes/menuRoutes";

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Database Initialization
AppDataSource.initialize()
    .then(() => {
        console.log("Database has been initialized!");
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/menus", menuRoutes);

app.get('/', (req, res) => res.send('API Multi-Role Ready!'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));