import mongoose, { Document, mongo, Schema } from 'mongoose';
import { IUser } from './User';

export interface IFolder {
    name: string,
    owner: mongoose.Types.ObjectId,
    parent: mongoose.Types.ObjectId | null,
}

const FolderSchema = new Schema<IFolder>({
    name: {type: String, required: true },
    owner: {type: Schema.Types.ObjectId, ref: "User", required: true},
    parent: {type: Schema.Types.ObjectId, ref: "Folder"},
})

const Folder = mongoose.model<IFolder>("Folder", FolderSchema);
export default Folder;