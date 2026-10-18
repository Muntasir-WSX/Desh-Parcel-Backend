import { Router } from "express";
import { PublicControllers } from "./public.controller";

const router = Router();

router.get('/reviews', PublicControllers.getReviews);
router.post('/newsletter', PublicControllers.subscribeNewsletter);
router.get('/blogs', PublicControllers.getAllBlogs);
router.get('/blogs/:id', PublicControllers.getBlogById);

export const publicRoutes = router;