import express, { Request, Response } from "express";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import cookieParser from "cookie-parser";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});

import categoryRouter from "./category/category-router";
import productRouter from "./product/product-router";

app.use("/categories", categoryRouter);
app.use("/products", productRouter);

app.use(globalErrorHandler);

export default app;
