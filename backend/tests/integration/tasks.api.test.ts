import request from 'supertest';
import app from '../../src/app';

describe('Tasks API Integration', () => {
  let tokenA: string;
  let tokenB: string;
  let userBId: string;

  beforeEach(async () => {
    // Register User A (Poster)
    const resA = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'User A',
        email: 'usera@cuchd.in',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        university: 'Chandigarh University'
      });
    tokenA = resA.headers['set-cookie'][0];

    // Register User B (Applicant)
    const resB = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'User B',
        email: 'userb@cuchd.in',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        university: 'Chandigarh University'
      });
    tokenB = resB.headers['set-cookie'][0];
    userBId = resB.body.data.user._id;
  });

  it('should allow a complete task lifecycle with dual-party payment confirmation', async () => {
    // 1. User A creates a task
    const createRes = await request(app)
      .post('/api/v1/swap/tasks')
      .set('Cookie', tokenA)
      .send({
        title: 'Need help with Calculus',
        description: 'Derivatives are hard',
        coinReward: 20,
        category: 'tutoring',
        urgency: 'high'
      })
      .expect(201);

    const taskId = createRes.body.data.task._id;
    expect(createRes.body.data.task.status).toBe('open');

    // 2. User B applies for the task
    await request(app)
      .post(`/api/v1/swap/tasks/${taskId}/apply`)
      .set('Cookie', tokenB)
      .send({ message: 'I can help with this task very well!' })
      .expect(200);

    // 3. User A assigns the task to User B
    const assignRes = await request(app)
      .post(`/api/v1/swap/tasks/${taskId}/assign`)
      .set('Cookie', tokenA)
      .send({ applicantId: userBId })
      .expect(200);

    expect(assignRes.body.data.task.status).toBe('in_progress');
    expect(assignRes.body.data.task.doer).toBe(userBId);

    // 4. User B submits the task
    await request(app)
      .post(`/api/v1/swap/tasks/${taskId}/submit`)
      .set('Cookie', tokenB)
      .send({ submissionNote: 'I have finished the Calculus work!' })
      .expect(200);

    // 5. User A claims payment
    const claimRes = await request(app)
      .post(`/api/v1/swap/tasks/${taskId}/claim-payment`)
      .set('Cookie', tokenA)
      .expect(200);

    expect(claimRes.body.data.task.paymentClaimed).toBe(true);

    // 6. User B confirms receipt
    const completeRes = await request(app)
      .post(`/api/v1/swap/tasks/${taskId}/complete`)
      .set('Cookie', tokenB)
      .send({ completionNote: 'Thanks for the payment, it was great working with you!' })
      .expect(200);

    expect(completeRes.body.data.task.status).toBe('completed');
  });
});
