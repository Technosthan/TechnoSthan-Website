import express from "express";
import cors from "cors";

import routes from "./routes/index.js";
import testRoutes from "./routes/test.routes.js";

import errorMiddleware from "./core/middlewares/error.middleware.js";
import notFoundMiddleware from "./core/middlewares/notFound.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", routes);
app.use(errorMiddleware);
app.use(notFoundMiddleware);

//for testing purpose
app.use("/api/test", testRoutes);




export default app;