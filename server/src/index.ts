import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";

import mongoose, { mongo } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config();

const app = express();
const port  = 1234;
const MONGO_URI = "mongodb://localhost:27017/testdb";
const SALT_ROUNDS = 10;


const connectDB = async () => {
    try {
        console.log("Connecting database");
        await mongoose.connect(MONGO_URI);
        console.log("Database Connected");
        // await User.init();
    } catch (error) {
        console.log("Database connection failed");
        process.exit(1);
    }
}

// FUNCTIONS



// ROUTES




if (process.env.NODE_ENV === "development") {
    const corsOptions: CorsOptions = {
        origin: 'http://localhost:3000',
        optionsSuccessStatus: 200
    }
    app.use(cors(corsOptions))
} else if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.resolve('../..', 'client', 'build')))
    app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.resolve('../..', 'client', 'build', 'index.html'))
    })
}


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})