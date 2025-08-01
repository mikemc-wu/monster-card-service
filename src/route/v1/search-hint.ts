import { loggerInstance } from "../../middleware/winston-logging.ts";
import {
	monsters,
	monsterTypes,
	cardGrades,
	cardYears,
	cardPrices,
	searchableKeys,
	sortableKeys
} from "../../component/schema-model.ts";

export const hintAndCriteria = async (ctx) => {
	try {
		const data = {
			monsters,
			monsterTypes,
			cardGrades,
			cardYears,
			cardPrices,
			searchableFields: searchableKeys,
			sortableFields: sortableKeys
		};
		ctx.status = 200;
		ctx.type = "application/json";
		ctx.body = { data };
	} catch (e) {
		const { ip, method, url } = ctx;
		loggerInstance.log(
			"error",
			`Error while handling route /hint-and-criteria: ${e}`,
			{ ip, method, url }
		)
		ctx.throw(500, "internal server error");
	}
}