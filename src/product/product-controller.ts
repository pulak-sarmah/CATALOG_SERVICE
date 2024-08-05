import { ProductService } from "./product-service";
import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Logger } from "winston";
import { Product } from "./product-types";
import { FileStorage } from "../common/types/storage";
import { v4 as uuid4 } from "uuid";
import { UploadedFile } from "express-fileupload";
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
}