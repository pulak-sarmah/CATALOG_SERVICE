import express from "express";
import logger from "../config/logger";
import { ProductController } from "./product-controller";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import createProductValidator from "./create-product-validator";

const router = express.Router();

const productController = new ProductController(logger);

router.post(
    "/",
    authenticate,
    createProductValidator,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    productController.create,
);

export default router;
