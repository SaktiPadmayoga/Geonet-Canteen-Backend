import User, { IUser } from "../models/User";

export class UserService {
    static async getUserByFirebaseUid(firebaseUid: string): Promise<IUser | null> {
        return User.findOne({ firebaseUid }).exec();
    }

    static async createUser(data: { firebaseUid: string; email: string; username: string; role: string }): Promise<IUser> {
        try {
            const user = new User(data);
            await user.save();
            return user.toObject();
        } catch (error) {
            throw new Error(`Failed to create user: ${(error as Error).message}`);
        }
    }
}
