import { HydratedDocument } from "mongoose";
import {
	monsters,
	monsterTypes,
	cardGrades,
	MonsterCard,
	sortableKeys,
	BaseMonsterCard
} from "../../component/schema-model.ts";
import { loggerInstance } from "../../middleware/winston-logging.ts";

interface screenQuery {
	monster?: string | string[],
	type?: string | string[],
	grade?: string | string[],
	year?: string | string[],
	price?: string | string[],
	start?: string | string[],
	count?: string | string[],
	sort?: string | string[],
}

/* There is a huge difference between search and screen functionality. When screening, users are Not allowed to input whatever, we define all the screenable criteria, this makes it easy for us to validate query strings */
const yearToFilter = {
	"-2000": { "year": { $lte: 2000 } },
	"2000-2010": { "year": { $gt: 2000, $lte: 2010 } },
	"2010-2020": { "year": { $gt: 2010, $lte: 2020 } },
	"2020+": { "year": { $gt: 2020 } },
}
const priceToFilter = {
	"<$20": { "price": { $lte: 20 } },
	"$20-$50": { "price": { $gt: 20, $lte: 50 } },
	"$50-$100": { "price": { $gt: 50, $lte: 100 } },
	"$100-$200": { "price": { $gt: 100, $lte: 200 } },
	">$200": { "price": { $gt: 200 } },
}
const queryParamKeyToValidValues = {
	"monster": monsters,
	"type": monsterTypes,
	"grade": cardGrades,
	"year": yearToFilter,
	"price": priceToFilter,
	"start": (strArr: string[]): number | typeof NaN => strArr.length === 1 ? parseInt(strArr[0]) : NaN,
	"count": (strArr: string[]): number | typeof NaN => strArr.length === 1 ? parseInt(strArr[0]) : NaN,
	"sort": (strArr: string[]): object | null => {
		const [field, order] = strArr;
		const permittedOrders = ["1", "-1"];

		if (strArr.length !== 2 || !sortableKeys.includes(field) || !permittedOrders.includes(order)) {
			return null;
		}

		return { [field]: parseInt(order) };
	}
}
const formatQueryParam = (queryParam: screenQuery): [string, string[]][] | null => {
	const queryParams: [string, any][] = Object.entries(queryParam);

	if (queryParams.some(([key, value]) => typeof value !== "string")) {
		return null;
	}

	return queryParams.map(([key, value]) => {
		if (key === "grade") {
			const parsedValue = value.split(",").map(str => parseFloat(str));
			return [key, parsedValue];
		}

		return [key, value.split(",")];
	});
}
const validateQueryParamKey = (queryParams: [string, string[]][]): boolean => {
	const hasStart = queryParams.some(([key, values]) => key === "start");
	const hasCount = queryParams.some(([key, values]) => key === "count");
	const hasSort = queryParams.some(([key, values]) => key === "sort");
	return hasStart && hasCount && hasSort;
}
const validateQueryParamValue = (queryParams: [string, string[]][]): boolean => queryParams.every(([key, values]) => {
	const validValues = queryParamKeyToValidValues[key];

	if (!validValues) {
		return false;
	}

	const occurrenceCount: object = values.reduce((acc, cur) => {
		const count: number | undefined = acc[cur];
		acc[cur] = count ? count + 1 : 1;
		return acc;
	}, {});

	if (values.some(value => occurrenceCount[value] !== 1)) {
		return false;
	}

	if (key === "year" || key === "price") {
		return values.every(value => validValues[value]);
	}

	if (key === "start" || key === "count") {
		return Number.isInteger(validValues(values));
	}

	if (key === "sort") {
		return validValues(values);
	}

	return values.every(value => validValues.includes(value));
});
const buildQueryFilters = (queryParams: [string, string[]][]): object => {
	const buildSingleQueryFilter = (queryParam: [string, string[]]): object[] => {
		const [key, values] = queryParam;
		const validValues = queryParamKeyToValidValues[key];

		if (key === "year" || key === "price") {
			return [{ $or: values.map(value => validValues[value]) }];
		}

		if (key === "start" || key === "count" || key === "sort") {
			return [];
		}

		return [{ [key]: { $in: values } }];
	}

	return { $and: queryParams.reduce((acc: any[], cur) => acc.concat(buildSingleQueryFilter(cur)), []) }
}
const extractSkipLimitSort = (queryParams: [string, string[]][]) => {
	return queryParams.reduce((acc, cur) => {
		const [key, values] = cur;
		const validValues = queryParamKeyToValidValues[key];

		if (key === "start" || key === "count" || key === "sort") {
			acc[key] = validValues(values);
			return acc;
		}

		return acc;
	}, {});
}

export const screenCard = async (ctx) => {
	const formattedQueryParams = formatQueryParam(ctx.query);
	const hasValidKeys = validateQueryParamKey(formattedQueryParams);
	const hasValidValues = validateQueryParamValue(formattedQueryParams);

	if (!formattedQueryParams || !hasValidKeys || !hasValidValues) {
		ctx.throw(400, "Invalid screen criteria");
	}

	const queryFilters = buildQueryFilters(formattedQueryParams);
	// @ts-ignore
	const { start: skip, count: limit, sort } = extractSkipLimitSort(formattedQueryParams);

	try {
		const results: [HydratedDocument<BaseMonsterCard>[], number] = await Promise.all([
			MonsterCard.find(queryFilters).skip(skip).limit(limit).sort(sort),
			MonsterCard.countDocuments(queryFilters)
		]);
		const data = results[0].map(doc => doc.getInfo());
		const total = results[1]

		ctx.status = 200;
		ctx.type = "application/json";
		ctx.body = { data, total };
	} catch (e) {
		const { ip, method, url } = ctx;
		loggerInstance.log(
			"error",
			`Error while handling route /screen-card: ${e}`,
			{ ip, method, url }
		)
		ctx.throw(500, "internal server error");
	}
}