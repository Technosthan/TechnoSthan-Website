export const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://ih.technosthan.com",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token", "x-technosthan-token"],
};
