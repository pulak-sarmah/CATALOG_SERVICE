import { ProductService } from "./product-service";
import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Logger } from "winston";
import { Filter, Product } from "./product-types";
import { FileStorage } from "../common/types/storage";
import { v4 as uuid4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import { AuthRequest } from "../common/types";
import { Roles } from "../common/constants";
import mongoose from "mongoose";

export class ProductController {
    constructor(
        private productService: ProductService,
        private logger: Logger,
        private storage: FileStorage,
    ) {
        // no need to use bind(this) in as we are using arrow functions
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const image = req.files!.image as UploadedFile;

        const imageName = uuid4();

        await this.storage.upload({
            filename: imageName,
            fileData: image.data.buffer,
        });

        const {
            name,
            description,
            priceConfiguration,
            attributes,
            categoryId,
            tenantId,
            isPublish,
        } = req.body as Product;

        const product: Product = {
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration) as string,
            attributes: JSON.parse(attributes) as string,
            categoryId,
            tenantId,
            isPublish,
            image: imageName,
        };

        const newProduct = await this.productService.createProduct(product);

        res.json({ id: newProduct._id });
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const { productId } = req.params;

        const ExistingProduct = await this.productService.getProduct(productId);

        if (!ExistingProduct) {
            return next(createHttpError(404, "Product not found"));
        }

        if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
            const tenantIdFromAuth = (req as AuthRequest).auth.tenant;

            if (ExistingProduct.tenantId !== String(tenantIdFromAuth)) {
                return next(
                    createHttpError(
                        403,
                        "You are not allowed to access this product",
                    ),
                );
            }
        }

        let imageName: string | undefined;
        let oldImage: string | undefined | null;

        if (req.files?.image) {
            oldImage = ExistingProduct.image;
            const image = req.files.image as UploadedFile;
            imageName = uuid4();

            await this.storage.upload({
                filename: imageName,
                fileData: image.data.buffer,
            });

            await this.storage.delete(oldImage);
        }

        const {
            name,
            description,
            priceConfiguration,
            attributes,
            categoryId,
            tenantId,
            isPublish,
        } = req.body as Product;

        const product = {
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration) as string,
            attributes: JSON.parse(attributes) as string,
            categoryId,
            tenantId,
            isPublish,
            image: imageName ? imageName : (oldImage as string),
        };

        await this.productService.updateProduct(productId, product);

        res.json({ id: productId });
    };

    index = async (req: Request, res: Response) => {
        const { q, tenantId, categoryId, isPublish } = req.query;

        const filters: Filter = {};

        if (isPublish === "true") {
            filters.isPublish = true;
        }

        if (tenantId) {
            filters.tenantId = tenantId as string;
        }

        if (
            categoryId &&
            mongoose.Types.ObjectId.isValid(categoryId as string)
        ) {
            filters.categoryId = new mongoose.Types.ObjectId(
                categoryId as string,
            );
        }

        const products = await this.productService.getProducts(
            filters,
            q as string,
            {
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit
                    ? parseInt(req.query.limit as string)
                    : 10,
            },
        );

        const finalProducts = (products.data as Product[]).map(
            (product: Product) => {
                return {
                    ...product,
                    image: this.storage.getObjectUri(product.image),
                };
            },
        );

        res.json({
            data: finalProducts,
            total: products.total,
            CurrentPage: products.page,
            pageSize: products.limit,
        });
    };

    show = async (req: Request, res: Response, next: NextFunction) => {
        const { productId } = req.params;

        const product = await this.productService.getProduct(productId);

        if (!product) {
            return next(createHttpError(404, "Product not found"));
        }

        // if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
        //     const tenantIdFromAuth = (req as AuthRequest).auth.tenant;

        //     if (product.tenantId !== String(tenantIdFromAuth)) {
        //         return next(
        //             createHttpError(
        //                 403,
        //                 "You are not allowed to access this product",
        //             ),
        //         );
        //     }
        // }

        res.json({
            ...product,
            image: this.storage.getObjectUri(product.image),
        });
    };
}
