import mongoose, {Document, Schema} from "mongoose";

export interface IUser {
    email: string,
    password: string,
}

const UserSchema = new Schema<IUser>({
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
})

const User = mongoose.model<IUser>("User", UserSchema);

export default User;