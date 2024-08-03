import express, { Request, Response } from "express";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import cookieParser from "cookie-parser";
const app = express();

app.use(express.json());

app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});

import categoryRouter from "./category/category-router";

app.use("/categories", categoryRouter);

app.use(globalErrorHandler);

export default app;
