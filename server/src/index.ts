import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";

import mongoose, { mongo } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "node:path";
import { validationResult } from "express-validator";

import User, { IUser } from "./models/User";
import { registerValidator } from "./middleware/inputValidation";

dotenv.config();

const app = express();
const port  = 1234;
const MONGO_URI = "mongodb://localhost:27017/testDB";
const SALT_ROUNDS = 10;


const connectDB = async () => {
    try {
        console.log("Connecting database");
        await mongoose.connect(MONGO_URI);
        console.log("Database Connected");
        await User.init();
    } catch (error) {
        console.log("Database connection failed");
        process.exit(1);
    }
}

connectDB();
app.use(express.json());

// TYPES

type TUser = {
    email: string,
    password: string,
    isAdmin: boolean
}


async function newRegistration(email: string, username: string, password: string, isAdmin: boolean) {
    console.log("creating a new user");
    if (await User.findOne({email})) {
        console.log("user already exists")
        throw new AuthenticationError(`User ${email} already exists`);
    } else {
        const new_user = new User({email, username, password, isAdmin});
        console.log("Database: new user")
        await new_user.save();
        return new_user;
    }
}


// ROUTES


app.post("/api/user/register", 
    registerValidator, 
    async(req: Request, res: Response) => {
        const email = req.body.email;
        const username = req.body.username;
        const isAdmin = req.body.isAdmin;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }
        const pw = await bcrypt.hash(req.body.password, SALT_ROUNDS);
        console.log(pw);
        try {
            const newUser = await newRegistration(email, username, pw, isAdmin);
            return res.status(200).json(newUser);
        } catch (e) {
            if (e instanceof AuthenticationError) {
                res.status(403).json({message: e.message})
            }
        }
    });

app.post("/api/user/login", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({email});

    if (!(user)) return res.status(404).json({message: "User doesn't exist"});


    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({});

    const secret = process.env.SECRET;
    if (!secret) return res.status(500).json({});
    const token = jwt.sign({_id: user._id, username: user.username || "guest", isAdmin: user.isAdmin}, secret, {expiresIn: "1h"});
    return res.status(200).json({ token });
})

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


// ERRORS


class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserAlreadyExistsError";
  }
}