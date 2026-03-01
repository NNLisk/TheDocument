import User, { IUser } from "../models/User";
import { AuthenticationError } from '../errors/errors'


export async function newRegistration(email: string, password: string) {
    console.log("creating a new user");
    if (await User.findOne({email})) {
        console.log("user already exists")
        throw new AuthenticationError(`User ${email} already exists`);
    } else {
        const new_user = new User({email, password});
        console.log("Database: new user")
        await new_user.save();
        return new_user;
    }
}

