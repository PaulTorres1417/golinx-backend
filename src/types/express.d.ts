// src/types/express.d.ts
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name: string;
      avatar: string;
      username: string;
      provider: string;
      provider_id: string;
    }
  }
}

export {};