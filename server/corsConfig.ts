import cors, { CorsOptions } from "cors";
import { securityLogger } from "./security";

/**
 * Enhanced CORS configuration for production
 */
export const corsOptions: CorsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) {
      securityLogger.debug("CORS check skipped (no origin header)");
      return callback(null, true);
    }

    // Prefer environment-based allowlist for flexibility
    const envAllowed = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
      : [];

    const allowedOrigins =
      process.env.NODE_ENV === "production"
        ? [
            "https://aortatrace.org",
            "https://www.aortatrace.org",
            ...envAllowed, // support env-based injection
          ]
        : [
            "http://localhost:5000",
            "http://127.0.0.1:5000",
            /^https:\/\/.*\.replit\.dev$/,
            /^https:\/\/.*\.repl\.co$/,
            ...envAllowed,
          ];

    const isAllowed = allowedOrigins.some((allowed) =>
      typeof allowed === "string" ? origin === allowed : allowed.test(origin)
    );

    if (isAllowed) {
      securityLogger.debug("CORS allowed", { origin });
      callback(null, true);
    } else {
      securityLogger.warn("CORS blocked", { origin });
      callback(new Error(`CORS: Origin ${origin} not allowed`), false);
    }
  },

  credentials: true,
  optionsSuccessStatus: 200,

  // Security hardening
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "X-CSRF-Token",
  ],
  exposedHeaders: ["Content-Disposition"], // allow file downloads
  maxAge: 600, // cache preflight results for 10 min
};

export default cors(corsOptions);
