import mongoose, { Document, mongo, Schema } from 'mongoose';
import { v4 as uuidv4 } from "uuid";

// some file explanations:
// parent refers to the parent folder, if i make it
// sharecode is the code used for non-authenticated 
// view only doc reading
// usersWithEditRights is all the users with edit rights

export interface IFile {
    name: string,
    owner: mongoose.Types.ObjectId,
    parent: mongoose.Types.ObjectId | null,
    content: string,
    createdAt: Date,
    updatedAt: Date,
    shareCode: string,
    usersWithEditRights: mongoose.Types.ObjectId[],
    trashcanned: boolean
}

const FileSchema = new Schema<IFile>({
    name: { type: String },
    owner: {type: Schema.Types.ObjectId, ref: "User", required: true },
    parent: { type: Schema.Types.ObjectId, ref: "Folder" },
    content: { type: String },
    shareCode: {type: String},
    usersWithEditRights: [{type: Schema.Types.ObjectId, ref: "User"}],
    trashcanned: {type: Boolean, default: false}
}, {timestamps: true})

const File = mongoose.model<IFile>("File", FileSchema);
export default File;