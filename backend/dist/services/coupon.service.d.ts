type CouponCheckInput = {
    code: string;
    orderAmount: number;
    userId?: string;
};
export declare const checkCouponEligibility: ({ code, orderAmount, userId }: CouponCheckInput) => Promise<{
    coupon: import("mongoose").Document<unknown, {}, import("../models/Coupon.model").ICoupon, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Coupon.model").ICoupon & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    };
    discount: number;
    perUserMaxUses: number;
    userUses: number;
}>;
export {};
//# sourceMappingURL=coupon.service.d.ts.map