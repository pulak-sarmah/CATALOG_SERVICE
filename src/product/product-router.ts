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
import updateProductValidator from "./update-product-validator";
import { asyncWrapper } from "../common/utils/wrapper";

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
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fileSize: 500 * 1024 },
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, "File size exceeds the limit");
            next(error);
        },
    }),
    createProductValidator,

    asyncWrapper(productController.create),
);

router.put(
    "/:productId",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fileSize: 500 * 1024 },
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, "File size exceeds the limit");
            next(error);
        },
    }),
    updateProductValidator,
    asyncWrapper(productController.update),
);

router.get(
    "/",

    asyncWrapper(productController.index),
);

export default router;
