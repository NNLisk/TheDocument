import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import mongoose, { mongo } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "node:path";
import { validationResult } from "express-validator";

import User from "./models/User";
import Folder from "./models/Folder";
import File from "./models/File";

import { registerValidator } from "./middleware/inputValidation";
import { newRegistration } from "./utils/userUtils";
import { AuthenticationError } from "./errors/errors";
import { AuthRequest, validateToken } from "./middleware/tokenValidation";

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
        await Folder.init();
        await File.init();
    } catch (error) {
        console.log("Database connection failed");
        process.exit(1);
    }
}

connectDB();
app.use(express.json());

// ROUTES

app.post("/api/user/register", 
    registerValidator, 
    async(req: Request, res: Response) => {
        const email = req.body.email;
        const username = req.body.username;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }
        const pw = await bcrypt.hash(req.body.password, SALT_ROUNDS);
        console.log(pw);
        try {
            const newUser = await newRegistration(email, username, pw);
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
    if (!isValid) return res.status(401).json({message: "You inserted a wrong password"});

    const secret = process.env.SECRET;
    if (!secret) return res.status(500).json({message: "Internal server error: missing secret key"});
    const token = jwt.sign({_id: user._id, username: user.username || "guest"}, secret, {expiresIn: "1h"});
    return res.status(200).json({ token });
})


app.get('/api/user/foldercontent', validateToken, async (req: AuthRequest, res: Response) => {
  try {
    const folders = await Folder.find({ 
      owner: req.user!._id,
      parent: req.query.parent || null 
    });

    const files = await File.find({
        owner: req.user!._id,
        parent: req.query.parent || null,
    })
    res.status(200).json({folders, files});
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch contents" });
  }
})

app.post('/api/user/newfolder', validateToken, async (req: AuthRequest, res: Response) => {

})

app.delete('/api/user/deletefolder', validateToken, async (req: AuthRequest, res: Response) => {

})

app.post('/api/user/newfile', validateToken, async (req: AuthRequest, res: Response) => {
    const owner = req.user!._id
    
    const newFile = new File({name: 'untitled', owner, content: ''})
    await newFile.save();
    
    return res.status(200).json(newFile);
})

app.get('/api/user/file', validateToken, async (req: AuthRequest, res: Response) => {
    const file = req.query.fileid;

    
})

app.delete('/api/user/deletefile', validateToken, async (req: AuthRequest, res: Response) => {
    
})

// Cors

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