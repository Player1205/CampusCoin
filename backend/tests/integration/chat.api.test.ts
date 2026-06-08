import request from 'supertest';
import app from '../../src/app';

describe('Chat API Integration', () => {
  let tokenA: string;
  let tokenB: string;
  let taskId: string;

  beforeEach(async () => {
    // Register User A
    const resA = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'User A',
        email: 'usera.chat@university.edu',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        university: 'Test University'
      });
    tokenA = resA.headers['set-cookie'][0];

    // Register User B
    const resB = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'User B',
        email: 'userb.chat@university.edu',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        university: 'Test University'
      });
    tokenB = resB.headers['set-cookie'][0];

    // User A creates a task to chat about
    const createRes = await request(app)
      .post('/api/v1/swap/tasks')
      .set('Cookie', tokenA)
      .send({
        title: 'Help with Calculus',
        description: 'This is a long enough description to pass validation',
        coinReward: 20,
        category: 'tutoring',
        urgency: 'high'
      });
    taskId = createRes.body.data.task._id;
  });

  it('should initialize a chat room and allow sending messages', async () => {
    // 1. User B initiates chat with User A about the task
    const initRes = await request(app)
      .post(`/api/v1/chats/interest/${taskId}`)
      .set('Cookie', tokenB)
      .expect(201);

    const chatId = initRes.body.data.chat._id;
    expect(initRes.body.data.chat.isActive).toBe(true);

    // 2. User B sends a message
    const msgRes = await request(app)
      .post(`/api/v1/chats/${chatId}/messages`)
      .set('Cookie', tokenB)
      .send({
        content: 'Hello, I want to help with your task!',
        type: 'text'
      })
      .expect(200);

    expect(msgRes.body.data.chat.messages).toHaveLength(1);
    expect(msgRes.body.data.chat.messages[0].content).toBe('Hello, I want to help with your task!');
  });
});
