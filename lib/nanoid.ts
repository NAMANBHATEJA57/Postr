import { customAlphabet } from "nanoid";

// NanoID 21 characters as per spec
const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export const generateId = customAlphabet(alphabet, 21);
