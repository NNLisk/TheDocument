import mongoose, { Document, mongo, Schema } from 'mongoose';
import { v4 as uuidv4 } from "uuid";

export interface IFile {
    name: string,
    owner: mongoose.Types.ObjectId,
    parent: mongoose.Types.ObjectId | null,
    content: string,
    createdAt: Date,
    updatedAt: Date,
    shareCode: string,
    usersWithEditRights: mongoose.Types.ObjectId[]
}

const FileSchema = new Schema<IFile>({
    name: { type: String },
    owner: {type: Schema.Types.ObjectId, ref: "User", required: true },
    parent: { type: Schema.Types.ObjectId, ref: "Folder" },
    content: { type: String },
    shareCode: {type: String},
    usersWithEditRights: [{type: Schema.Types.ObjectId, ref: "User"}]
}, {timestamps: true})

const File = mongoose.model<IFile>("File", FileSchema);
export default File;