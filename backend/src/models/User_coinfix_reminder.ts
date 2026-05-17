/**
 * PATCH for backend/src/models/User.ts
 * 
 * Find the coinBalance field definition and ensure default is 100:
 * 
 *   coinBalance: {
 *     type: Number,
 *     default: 100,     ← must be 100, not 0
 *     min: [0, 'Coin balance cannot be negative'],
 *   },
 * 
 * This file is a reminder — apply the fix directly in your existing User.ts
 */
export {};
