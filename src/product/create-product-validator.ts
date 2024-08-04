import { body } from "express-validator";

export default [
    body("name")
        .exists()
        .withMessage("Product name is required")
        .isString()
        .withMessage("Product name must be a string")
        .isLength({ min: 1, max: 255 }),

    body("description").exists().withMessage("Description  is required"),

    body("priceConfiguration")
        .exists()
        .withMessage("priceConfiguration  is required"),

    body("attributes").exists().withMessage("Attributes  is required"),

    body("tenantId").exists().withMessage("TenantId  is required"),

    body("categoryId").exists().withMessage("CategoryId  is required"),

    body("image").custom((value, { req }) => {
        if (!req.files) throw new Error("Product image is required");
        return true;
    }),
];
