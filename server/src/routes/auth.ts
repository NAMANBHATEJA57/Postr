import { Router, type Request, type Response } from "express";

const router = Router();

router.post("/register", (req: Request, res: Response) => {
    return res.status(400).json({ error: "Registration disabled" });
});

router.post("/login", (req: Request, res: Response) => {
    return res.status(400).json({ error: "Login disabled" });
});

router.post("/logout", (req: Request, res: Response) => {
    res.clearCookie("token");
    return res.json({ success: true });
});

router.get("/me", (req: Request, res: Response) => {
    return res.status(401).json({ error: "Unauthorized" });
});

export default router;
