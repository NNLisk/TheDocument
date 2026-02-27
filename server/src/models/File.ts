import mongoose, { Document, mongo, Schema } from 'mongoose';

export interface IFile {
    name: string,
    owner: mongoose.Types.ObjectId,
    parent: mongoose.Types.ObjectId | null,
    content: string,
    createdAt: Date,
    updatedAt: Date,
}

const FileSchema = new Schema<IFile>({
    name: { type: String },
    owner: {type: Schema.Types.ObjectId, ref: "User", required: true },
    parent: { type: Schema.Types.ObjectId, ref: "Folder" },
    content: { type: String }
}, {timestamps: true})

const File = mongoose.model<IFile>("File", FileSchema);
export default File;