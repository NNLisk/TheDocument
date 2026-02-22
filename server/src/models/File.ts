import mongoose, { Document, mongo, Schema } from 'mongoose';

export interface IFile {
    name: string,
    owner: mongoose.Types.ObjectId,
    parent: mongoose.Types.ObjectId | null,
    content: string,
}

const FileSchema = new Schema<IFile>({
    name: { type: String, required: true},
    owner: {type: Schema.Types.ObjectId, ref: "User", required: true },
    parent: { type: Schema.Types.ObjectId, ref: "Folder" },
    content: { type: String }
})

const File = mongoose.model<IFile>("File", FileSchema);
export default File;