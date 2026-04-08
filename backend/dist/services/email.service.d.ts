export declare const sendOrderConfirmation: (to: string, orderNumber: string, totalAmount: number, items: {
    name: string;
    quantity: number;
    price: number;
}[]) => Promise<void>;
export declare const sendNewOrderNotification: (orderNumber: string, totalAmount: number, customerName: string) => Promise<void>;
//# sourceMappingURL=email.service.d.ts.map