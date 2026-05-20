"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.login = exports.register = void 0;
const authService = __importStar(require("../services/auth.service"));
const sendTokenResponse = (res, statusCode, token, user) => {
    res
        .status(statusCode)
        .cookie('token', token, authService.cookieOptions)
        .json({
        status: 'success',
        data: { user, token },
    });
};
const register = async (req, res, next) => {
    try {
        const { user, token } = await authService.registerUser(req.body);
        sendTokenResponse(res, 201, token, user);
    }
    catch (err) {
        next(err);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { user, token } = await authService.loginUser(req.body);
        sendTokenResponse(res, 200, token, user);
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
const logout = (_req, res) => {
    res
        .status(200)
        .clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
    })
        .json({
        status: 'success',
        data: { message: 'Logged out successfully.' },
    });
};
exports.logout = logout;
const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ status: 'fail', message: 'Not authenticated.' });
            return;
        }
        const user = await authService.getCurrentUser(req.user._id.toString());
        res.status(200).json({
            status: 'success',
            data: { user },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getMe = getMe;
//# sourceMappingURL=auth.controller.js.map