import { ProductService } from "./product-service";
import express from "express";
import logger from "../config/logger";
import { ProductController } from "./product-controller";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import createProductValidator from "./create-product-validator";
import fileUpload from "express-fileupload";
import { s3Storage } from "../common/services/s3Storage";

import createHttpError from "http-errors";

const router = express.Router();

const productService = new ProductService();
const storage = new s3Storage();
const productController = new ProductController(
    productService,
    logger,
    storage,
);

router.post(
    "/",
    authenticate,
    fileUpload({
        limits: { fileSize: 500 * 1024 },
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, "File size exceeds the limit");
            next(error);
        },
    }),
    createProductValidator,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    productController.create,
);

export default router;