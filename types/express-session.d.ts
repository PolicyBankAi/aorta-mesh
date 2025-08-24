import "express-session";

declare module "express-session" {
  interface SessionData {
    demoUser?: any;
    [key: string]: any;
  }
}
