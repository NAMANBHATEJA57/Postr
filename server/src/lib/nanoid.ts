import { customAlphabet } from "nanoid";

const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const spaceAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const generateId = customAlphabet(alphabet, 21);
export const generateSpaceCode = customAlphabet(spaceAlphabet, 6);
