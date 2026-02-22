import mongoose, {Document, Schema} from "mongoose";

export interface IUser {
    email: string,
    password: string,
    username: string,
    isAdmin: boolean
}

const UserSchema = new Schema<IUser>({
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    username: {type: String},
    isAdmin: {type: Boolean}
})

const User = mongoose.model<IUser>("User", UserSchema);

export default User;