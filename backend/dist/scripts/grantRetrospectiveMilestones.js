"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const User_1 = __importDefault(require("../models/User"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const grantRetrospectiveMilestones = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campuscoin';
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB');
        const users = await User_1.default.find({
            'skills.2': { $exists: true },
            'milestoneRewards.skills': false
        });
        console.log(`Found ${users.length} users who deserve the skills milestone reward.`);
        for (const user of users) {
            user.coinBalance += 10;
            user.milestoneRewards.skills = true;
            await user.save();
            console.log(`Granted +10 coins to user ${user.email}`);
        }
        const avatarUsers = await User_1.default.find({
            avatarUrl: { $exists: true, $ne: '' },
            'milestoneRewards.avatar': false
        });
        console.log(`Found ${avatarUsers.length} users who deserve the avatar milestone reward.`);
        for (const user of avatarUsers) {
            user.coinBalance += 20;
            user.milestoneRewards.avatar = true;
            await user.save();
            console.log(`Granted +20 coins to user ${user.email} for avatar`);
        }
        console.log('Done granting retrospective rewards.');
        process.exit(0);
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};
grantRetrospectiveMilestones();
//# sourceMappingURL=grantRetrospectiveMilestones.js.map