import { CategoryController } from "./category-controller";
import express from "express";
import categoryValidator from "./category-validator";

const router = express.Router();

const categoryController = new CategoryController();

router.post("/", categoryValidator, categoryController.create);

export default router;
