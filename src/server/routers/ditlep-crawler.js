import { Router } from "express";

import controllers from "../controllers/index.js";

const ditlepCrawler = controllers.ditlepCrawler;
const router = Router();

router.get("/ditlep/alliance-chests/:month", ditlepCrawler.allianceChests);

export default router;