import request from 'supertest';
import app from '../../src/app';
import Post from '../../src/models/Post';

describe('Flex Feed API', () => {
  let tokenCookie: string;
  let testUserId: string;

  beforeEach(async () => {
    // Register a user to get a cookie
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Flex User',
        email: 'flex@university.edu',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        university: 'Test University'
      });
    
    tokenCookie = res.headers['set-cookie'][0];
    testUserId = res.body.data.user._id;
  });

  describe('POST /api/v1/flex/posts', () => {
    it('should create a new post with an image URL', async () => {
      const postData = {
        type: 'general',
        content: 'Hello world',
        imageUrl: 'https://res.cloudinary.com/fake/image.jpg'
      };

      const res = await request(app)
        .post('/api/v1/flex/posts')
        .set('Cookie', tokenCookie)
        .send(postData)
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.data.post.content).toBe(postData.content);
      expect(res.body.data.post.imageUrl).toBe('https://res.cloudinary.com/fake/image.jpg');
    });
  });

  describe('GET /api/v1/flex/posts (Cursor Pagination)', () => {
    beforeEach(async () => {
      // Create 10 fake posts
      const postsToInsert = Array.from({ length: 10 }).map((_, i) => ({
        author: testUserId,
        university: 'Test University',
        type: 'general',
        content: `Post number ${i}`,
        createdAt: new Date(Date.now() - i * 1000) // Stagger creation times
      }));
      await Post.insertMany(postsToInsert);
    });

    it('should return paginated results with a nextCursor', async () => {
      const res1 = await request(app)
        .get('/api/v1/flex/posts?limit=5')
        .set('Cookie', tokenCookie)
        .expect(200);

      expect(res1.body.data.data.length).toBe(5);
      expect(res1.body.data.pagination.nextCursor).toBeDefined();
      expect(res1.body.data.pagination.hasNextPage).toBe(true);

      const nextCursor = res1.body.data.pagination.nextCursor;

      // Make second request using the cursor
      const res2 = await request(app)
        .get(`/api/v1/flex/posts?limit=5&cursor=${nextCursor}`)
        .set('Cookie', tokenCookie)
        .expect(200);

      expect(res2.body.data.data.length).toBe(5);
      
      // Ensure no overlapping posts
      const firstIds = res1.body.data.data.map((p: any) => p._id);
      const secondIds = res2.body.data.data.map((p: any) => p._id);
      
      const overlap = firstIds.filter((id: string) => secondIds.includes(id));
      expect(overlap.length).toBe(0);
    });
  });
});
