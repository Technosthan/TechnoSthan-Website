import express from "express";
import cors from "cors";

import routes from "./routes/index.js";

import errorMiddleware from "./core/middlewares/error.middleware.js";
import notFoundMiddleware from "./core/middlewares/notFound.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "Technosthan API is live" });
});

app.use(errorMiddleware);
app.use(notFoundMiddleware);

export default app;
