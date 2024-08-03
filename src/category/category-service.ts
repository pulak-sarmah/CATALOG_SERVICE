import categoryModel from "./category-model";
import { Category } from "./category-types";

export class CategoryService {
    async create(category: Category) {
        const newCategory = new categoryModel(category);
        return newCategory.save();
    }
}
