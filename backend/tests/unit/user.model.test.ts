import mongoose from 'mongoose';
import User from '../../src/models/User';
import bcrypt from 'bcryptjs';

describe('User Model', () => {
  const validUserData = {
    name: 'Test User',
    email: 'test@university.edu',
    password: 'Password123!',
    university: 'Test University',
  };

  it('should create and save user successfully', async () => {
    const validUser = new User(validUserData);
    const savedUser = await validUser.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(validUserData.name);
    expect(savedUser.email).toBe(validUserData.email);
    expect(savedUser.university).toBe(validUserData.university);
    expect(savedUser.coinBalance).toBe(100); // Default value
    expect(savedUser.role).toBe('student'); // Default value
  });

  it('should fail if required fields are missing', async () => {
    const userWithoutRequiredField = new User({ name: 'Test' });
    let error;

    try {
      await userWithoutRequiredField.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    if (error instanceof mongoose.Error.ValidationError) {
      expect(error.errors.email).toBeDefined();
      expect(error.errors.password).toBeDefined();
      expect(error.errors.university).toBeDefined();
    }
  });

  it('should hash the password before saving', async () => {
    const user = new User(validUserData);
    await user.save();

    // The saved password should not be plain text
    expect(user.password).not.toBe(validUserData.password);
    
    // It should be a valid bcrypt hash
    const isMatch = await bcrypt.compare(validUserData.password, user.password as string);
    expect(isMatch).toBe(true);
  });

  it('should only hash password if modified', async () => {
    const user = new User(validUserData);
    await user.save();
    
    const firstHash = user.password;
    
    // Modify a non-password field
    user.name = 'Updated Name';
    await user.save();
    
    // The password hash should remain the exact same
    expect(user.password).toBe(firstHash);
  });
});
