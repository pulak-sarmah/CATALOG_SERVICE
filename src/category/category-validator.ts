import { body } from "express-validator";

export default [
    body("name")
        .exists()
        .withMessage("Category name is required")
        .isString()
        .withMessage("Category name must be a string")
        .isLength({ min: 1, max: 255 }),

    body("priceConfiguration")
        .exists()
        .withMessage("Price configuration is required"),

    body("priceConfiguration.*.priceType")
        .exists()
        .withMessage("Price type is required")
        .custom((value: "base" | "aditional") => {
            const validKeys = ["base", "aditional"];
            if (!validKeys.includes(value)) {
                throw new Error(
                    `${value} is invalid price type, possible values are ${validKeys.join(
                        ", ",
                    )}`,
                );
            }
            return true;
        }),
    body("attributes").exists().withMessage("Attributes are required"),
];
