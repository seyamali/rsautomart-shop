import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'customer' | 'admin';
    avatar?: {
        url: string;
        publicId: string;
    };
    address?: {
        street: string;
        area: string;
        district: string;
        division: string;
    };
    wishlist: mongoose.Types.ObjectId[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export default _default;
//# sourceMappingURL=User.model.d.ts.map