// types/express-session.d.ts

import "express-session";

declare module "express-session" {
  interface SessionData {
    // Existing keys from your code
    demoUser?: any;

    // Allow arbitrary custom keys without breaking type checks
    [key: string]: any;
  }
}
