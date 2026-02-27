import { IUser } from '../models/User'
import File, { IFile } from '../models/File'
import { IFolder } from '../models/Folder'
import mongoose from 'mongoose'


// FUNCTIONS

async function newFolder(name: string, owner: IUser, parent: IFolder) {
    
}

async function newFile(name: string, owner: mongoose.Types.ObjectId, parent: IFolder, content: string) {
    
}