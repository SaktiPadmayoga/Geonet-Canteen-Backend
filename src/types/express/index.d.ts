import type { DecodedIdToken } from "firebase-admin/auth";
import type { IUser } from "../../models/User";

declare global {
    namespace Express {
        interface Request {
            firebaseUser?: DecodedIdToken;
            user?: IUser;
        }
    }
}
export {};
