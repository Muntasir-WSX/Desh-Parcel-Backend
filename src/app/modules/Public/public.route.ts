import { Router } from "express";
import { PublicControllers } from "./public.controller";

const router = Router();

router.get('/reviews', PublicControllers.getReviews);

export const publicRoutes = router;