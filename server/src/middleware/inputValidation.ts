import { body } from "express-validator";

// validator checking the password and email against common rules.

export const registerValidator = [
    body("email").trim().isEmail().withMessage("Invalid email"),
    body("password")
    .trim()
    .isLength({min: 8})
    .withMessage("Password must have at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must have capital letters")
    .matches(/[a-z]/)
    .withMessage("Password must have lower case letters")
    .matches(/\d/)
    .withMessage("Password must have numbers")
    .matches(/[#!&?]/)
    .withMessage("Password must have special characters")
];