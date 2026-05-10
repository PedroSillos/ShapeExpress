export const testUsers = {
  andre: {
    email: process.env.TEST_USER_EMAIL || '',
    password: process.env.TEST_USER_PASSWORD || '',
    name: 'Andre 001',
    userType: 'atleta',
  },
} as const;
