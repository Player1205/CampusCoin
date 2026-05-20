import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const grantRetrospectiveMilestones = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campuscoin';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find users with 3 or more skills who haven't received the reward
    const users = await User.find({
      'skills.2': { $exists: true }, // Has at least 3 elements in skills array
      'milestoneRewards.skills': false
    });

    console.log(`Found ${users.length} users who deserve the skills milestone reward.`);

    for (const user of users) {
      user.coinBalance += 10;
      user.milestoneRewards.skills = true;
      await user.save();
      console.log(`Granted +10 coins to user ${user.email}`);
    }

    // Do the same for avatar
    const avatarUsers = await User.find({
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
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

grantRetrospectiveMilestones();
