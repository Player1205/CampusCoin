import { ClientSession } from 'mongoose';
export interface TransferResult {
    fromBalance: number;
    toBalance: number;
}
export declare const lockCoinsForTask: (userId: string, amount: number, session?: ClientSession) => Promise<number>;
export declare const releaseCoinsToUser: (userId: string, amount: number, session?: ClientSession) => Promise<number>;
export declare const transferCoins: (fromUserId: string, toUserId: string, amount: number) => Promise<TransferResult>;
export declare const directTransfer: (senderId: string, receiverId: string, amount: number) => Promise<TransferResult>;
//# sourceMappingURL=coin.service.d.ts.map