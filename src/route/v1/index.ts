import Router from "@koa/router";
import { hintAndCriteria } from "./search-hint.ts";
import { searchCard } from "./search-card.ts";
import { screenCard } from "./screen-card.ts";

const router = new Router();

router.get("/hint-and-criteria", hintAndCriteria);
router.get("/search-card", searchCard);
router.get("/screen-card", screenCard);

export default router;