const allowedOrigins = new Set([
  "http://localhost:5173",
  "https://ih.technosthan.com",
]);

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.has(origin)) {
    return true;
  }

  return /^https:\/\/([a-z0-9-]+\.)*technosthan\.com$/i.test(origin);
};

export const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
    "X-Requested-With",
    "x-auth-token",
    "x-technosthan-token",
  ],
  optionsSuccessStatus: 200,
};
