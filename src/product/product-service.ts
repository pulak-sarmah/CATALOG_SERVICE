import { paginationLabels } from "../config/pagination";
import productModel from "./product-model";
import { Filter, PaginateQuery, Product } from "./product-types";

export class ProductService {
    async createProduct(product: Product): Promise<Product> {
        return (await productModel.create(product)) as Product;
    }

    async updateProduct(
        productId: string,
        product: Product,
    ): Promise<Product | null> {
        return await productModel.findOneAndUpdate(
            {
                _id: productId,
            },
            { $set: product },
            { new: true },
        );
    }

    async getProduct(productId: string): Promise<Product | null> {
        return await productModel.findById({ _id: productId });
    }

    async getProducts(
        filters: Filter,
        q: string,
        paginateQuery: PaginateQuery,
    ) {
        const searchQueryRegexp = q ? new RegExp(q, "i") : /.*/;

        const matchQuery = {
            ...filters,
            name: searchQueryRegexp,
        };

        const aggregate = productModel.aggregate([
            {
                $match: matchQuery,
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                attributes: 1,
                                priceConfiguration: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: {
                    path: "$category",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
        ]);

        return productModel.aggregatePaginate(aggregate, {
            ...paginateQuery,
            customLabels: paginationLabels,
        });
    }

    async deleteProduct(productId: string): Promise<void> {
        await productModel.findByIdAndDelete(productId);
    }
}
