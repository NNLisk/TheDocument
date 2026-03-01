import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import mongoose, { mongo } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "node:path";
import { validationResult } from "express-validator";
import { v4 as uuidv4 } from 'uuid'

import User from "./models/User";
import Folder from "./models/Folder";
import File from "./models/File";

import { registerValidator } from "./middleware/inputValidation";
import { newRegistration } from "./utils/userUtils";
import { AuthenticationError } from "./errors/errors";
import { AuthRequest, validateToken } from "./middleware/tokenValidation";
import { fileURLToPath } from "node:url";

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
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }
        const pw = await bcrypt.hash(req.body.password, SALT_ROUNDS);
        console.log(pw);
        try {
            const newUser = await newRegistration(email, pw);
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
    const token = jwt.sign({_id: user._id}, secret, {expiresIn: "1h"});
    return res.status(200).json({ token });
})


app.get('/api/user/foldercontent', validateToken, async (req: AuthRequest, res: Response) => {
  try {
    const folders = await Folder.find({ 
      owner: req.user!._id,
      parent: req.query.parent || null 
    });

    const ownedfiles = await File.find({
        owner: req.user!._id,
        parent: req.query.parent || null,
    })

    const filesWithEditRight = await File.find({
        usersWithEditRights: req.user!._id
    })
    
    res.status(200).json({folders, files: ownedfiles, filesWithEditRight});
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

// updating file content
app.put('/api/user/file/:id', validateToken, async (req: AuthRequest, res: Response) => {

    const fileid = req.params.id;

    try {
        const file = await File.findOne({_id: fileid})
        if (!file) return res.status(404).json({message: 'not found'});
        const isOwner = file.owner.equals(req.user!._id)
        const hasEditRights = file.usersWithEditRights.some(id => id.equals(req.user!._id));

        if (!isOwner && !hasEditRights) return res.status(403).json({message: 'unauthorized'});
        file.content = req.body.content;
        await file.save()
        return res.status(200).json({message: `updated ${fileid}`})
    } catch (error) {
        return res.status(500).json({ message: 'something went wrong' })
    }
})

// fetchign file
app.get('/api/user/file/:id', validateToken, async (req: AuthRequest, res: Response) => {
    
    const fileid = req.params.id;
    
    try {
        const file = await File.findOne({ _id: fileid })
        if (!file) return res.status(404).json({ message: 'not found' });
        const isOwner = file.owner.equals(req.user!._id);
        const hasEditRights = file.usersWithEditRights.some(id => id.equals(req.user!._id));

        if (!isOwner && !hasEditRights) return res.status(403).json({message: 'unauthorized'})
        return res.status(200).json({file})
    } catch (error) {
        return res.status(500).json({ message: 'something went wrong' })
    }
})

// deleting files
app.delete('/api/user/file/:id', validateToken, async (req: AuthRequest, res: Response) => {
    const id = req.params.id;
    try {
        
        const { deletedCount } = await File.deleteOne({_id: id})
        
        if (deletedCount == 1) {
            return res.status(200).json({message: `deleted${id}`})
        } else {
            return res.status(404).json({ message: 'File not found' })
        }

    } catch (error) {
        res.status(500).json({message: 'deletion failed'})
    }
})

// renaming a file
app.put('/api/user/renamefile/:id', validateToken, async (req: AuthRequest, res:Response) => {

    const fileid = req.params.id;
    const name = req.body.name;
    try {
        const file = await File.findOne({ _id: fileid })
        if (!file) return res.status(404).json({ message: 'not found' });
        if (!name) return res.status(400).json({message: 'no name given'})
        const isOwner = file.owner.equals(req.user!._id)
        if (!isOwner) return res.status(403).json({message: 'unauthorized'});
        
        file.name = name;
        await file.save();
        return res.status(200).json({message: `Updated file ${fileid}`})
    } catch (error) {
        return res.status(500).json({ message: 'something went wrong' })
    }
})

app.put('/api/user/createsharecode/:id', validateToken, async (req: AuthRequest, res: Response) => {
    const fileid = req.params.id;
    const uuid = uuidv4();
    
    try {
        const file = await File.findOne({_id: fileid})
        if (!file) return res.status(404).json({ message: 'not found' });
        const isOwner = file.owner.equals(req.user!._id)
        if (!isOwner) return res.status(403).json({message: 'unauthorized'});
        
        file.shareCode = uuid;
        await file.save();
        return res.status(200).json({file})
    } catch (error) {
        return res.status(500).json({ message: 'something went wrong' })
    }
})

app.get('/api/user/viewfilewithcode/:code', async (req, res) => {
    const code = req.params.code;

    try {
        const file = await File.findOne({shareCode: code})
        if (!file) return res.status(404).json({ message: 'not found' });
        return res.status(200).json(file);
    } catch (error) {
        return res.status(500).json({ message: 'something went wrong' })
    }
})

app.post('/api/user/giveAccessToFile/:id', validateToken, async (req: AuthRequest, res: Response) => {

    try {
        const fileid = req.params.id;
        const recipient = req.body.recipientEmail;
        const recipientUser = await User.findOne({email: recipient})

        if (!recipientUser) return res.status(404).json({message: 'Recipient not found'});
        const updatedFile = await File.findByIdAndUpdate(
            fileid,
            {
            $addToSet: { usersWithEditRights: recipientUser._id }
            },
            { new: true }
        );
        if (!updatedFile) {
            return res.status(404).json({ message: "File not found" });
        }
        res.status(200).json(updatedFile);
    } catch (error) {
        res.status(500).json({ message: "something went wrong" });
    }
})

// Cors from week 12 assignments, since its the same stack

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