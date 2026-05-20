"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = exports.sendVerificationOtp = exports.getMe = exports.updateMe = void 0;
const crypto_1 = __importDefault(require("crypto"));
const User_1 = __importDefault(require("../models/User"));
const email_service_1 = require("../services/email.service");
const updateMe = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const updates = req.body;
        if (updates.skills) {
            updates.skills = updates.skills.map((s) => s.trim().toLowerCase());
        }
        const user = await User_1.default.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });
        if (!user) {
            res.status(404).json({ status: 'fail', message: 'User not found.' });
            return;
        }
        let coinsAwarded = 0;
        if (user.skills.length >= 3 &&
            !user.milestoneRewards?.skills) {
            await User_1.default.findByIdAndUpdate(userId, {
                $inc: { coinBalance: 10 },
                $set: { 'milestoneRewards.skills': true },
            });
            user.coinBalance += 10;
            coinsAwarded += 10;
        }
        if (updates.avatarUrl &&
            updates.avatarUrl !== '' &&
            !user.milestoneRewards?.avatar) {
            await User_1.default.findByIdAndUpdate(userId, {
                $inc: { coinBalance: 20 },
                $set: { 'milestoneRewards.avatar': true },
            });
            user.coinBalance += 20;
            coinsAwarded += 20;
        }
        res.status(200).json({
            status: 'success',
            data: { user: user.toSafeObject(), coinsAwarded },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateMe = updateMe;
const getMe = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user._id);
        if (!user) {
            res.status(404).json({ status: 'fail', message: 'User not found.' });
            return;
        }
        res.status(200).json({
            status: 'success',
            data: { user: user.toSafeObject() },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getMe = getMe;
const sendVerificationOtp = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ status: 'fail', message: 'User not found.' });
            return;
        }
        if (user.isVerified) {
            res.status(400).json({ status: 'fail', message: 'Email is already verified.' });
            return;
        }
        const otp = crypto_1.default.randomInt(100000, 999999).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000);
        user.emailVerificationOtp = otp;
        user.emailVerificationOtpExpires = expires;
        await user.save();
        await (0, email_service_1.sendVerificationEmail)(user.email, otp);
        res.status(200).json({
            status: 'success',
            message: 'Verification email sent. Please check your inbox.',
        });
    }
    catch (err) {
        next(err);
    }
};
exports.sendVerificationOtp = sendVerificationOtp;
const verifyEmail = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { otp } = req.body;
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ status: 'fail', message: 'User not found.' });
            return;
        }
        if (user.isVerified) {
            res.status(400).json({ status: 'fail', message: 'Email is already verified.' });
            return;
        }
        if (!user.emailVerificationOtp ||
            !user.emailVerificationOtpExpires ||
            user.emailVerificationOtp !== otp ||
            user.emailVerificationOtpExpires.getTime() < Date.now()) {
            res.status(400).json({ status: 'fail', message: 'Invalid or expired OTP.' });
            return;
        }
        user.isVerified = true;
        user.emailVerificationOtp = undefined;
        user.emailVerificationOtpExpires = undefined;
        user.coinBalance += 50;
        await user.save();
        res.status(200).json({
            status: 'success',
            data: { user: user.toSafeObject(), coinsAwarded: 50 },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.verifyEmail = verifyEmail;
//# sourceMappingURL=user.controller.js.map