import mongoose, { Document, mongo, Schema } from 'mongoose';
import { IUser } from './User';

export interface IFolder {
    name: string,
    owner: mongoose.Types.ObjectId,
}

const FolderSchema = new Schema<IFolder>({
    name: {type: String, required: true },
    owner: {type: Schema.Types.ObjectId, ref: "User", required: true},
})

const Folder = mongoose.model<IFolder>("Folder", FolderSchema);
export default Folder;