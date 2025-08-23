import cors from 'cors';

// Enhanced CORS configuration for production security
export const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, origin?: boolean) => void
  ) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Define allowed origins based on environment
    const allowedOrigins =
      process.env.NODE_ENV === 'production'
        ? [
            'https://aortatrace.org',
            'https://www.aortatrace.org',
            // Add any other production domains
          ]
        : [
            'http://localhost:5000',
            'http://127.0.0.1:5000',
            /^https:\/\/.*\.replit\.dev$/,
            /^https:\/\/.*\.repl\.co$/,
            // Development patterns
          ];

    const isAllowed = allowedOrigins.some((allowedOrigin) => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      } else {
        return allowedOrigin.test(origin);
      }
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token',
  ],
};

export default cors(corsOptions);
