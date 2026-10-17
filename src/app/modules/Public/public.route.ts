import { Router } from "express";
import { PublicControllers } from "./public.controller";

const router = Router();

router.get('/reviews', PublicControllers.getReviews);
router.post('/newsletter', PublicControllers.subscribeNewsletter);

export const publicRoutes = router;