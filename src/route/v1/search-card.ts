import { HydratedDocument } from "mongoose";
import Fuse from "fuse.js";
import {
    minYear,
    searchableKeys,
    monsters,
    monsterTypes,
    cardGrades,
    MonsterCard,
    BaseMonsterCard,
} from "../../component/schema-model.ts";
import { loggerInstance } from "../../middleware/winston-logging.ts";

interface searchQuery {
    monster?: string | string[],
    type?: string | string[],
    grade?: string | string[],
    year?: string | string[],
    card?: string | string[]
}

const fuse = new Fuse(monsters, {
    isCaseSensitive: false,
    includeScore: true,
    shouldSort: true,
    minMatchCharLength: 3,
    threshold: 0.5,
    ignoreLocation: true,
});
const buildQueryFilter = (queryParam: searchQuery): object | null => {
    const queryParams: [string, string | string[]][] = Object.entries(queryParam);

    if (queryParams.length !== 1) {
        return null;
    }

    const [key, value] = queryParams[0];

    if (!searchableKeys.includes(key) || typeof value !== "string") {
        return null;
    }

    if (key === "card") {
        const monsterFound = monsters.find(monster => value.toLowerCase().includes(monster));
        return monsterFound
            ? { $or: [
                    { "card": { "$regex": value, "$options": "i" } },
                    { "card": { "$regex": monsterFound, "$options": "i" } },
                    { "monster": monsterFound }
                ] }
            : { "card": { "$regex": value, "$options": "i" } };
    }

    if (key === "monster") {
        const monsterFound = monsters.find(monster => value.toLowerCase().includes(monster));

        if (monsterFound) {
            return { "monster": monsterFound };
        }

        const searchResults = fuse
            .search(value)
            .slice(0, 3)
            .reduce((acc, { item }) => acc.concat([item]), []);
        return { "monster": { $in: searchResults } };
    }

    if (key === "type") {
        const typeFound = monsterTypes.find(monsterType => monsterType === value.toLowerCase());
        return typeFound ? { "type": typeFound } : null;
    }

    if (key === "grade") {
        // grade includes 0, which is falsy, thus we leverage findIndex instead of find
        const parsedGrade = parseFloat(value);
        const gradeFoundIndex = cardGrades.findIndex(monsterGrade => monsterGrade === parsedGrade);
        return gradeFoundIndex !== -1 ? { "grade": parsedGrade } : null;
    }

    if (key === "year") {
        const parsedYear = parseInt(value);
        return parsedYear && parsedYear >= minYear && parsedYear <= (new Date()).getFullYear()
            ? { "year": parsedYear }
            : null;
    }

    return null;
}

export const searchCard = async (ctx) => {
    const queryFilter = buildQueryFilter(ctx.query);

    if (!queryFilter) {
        ctx.throw(400, "Invalid search parameter");
    }
    
    try {
        const docs: HydratedDocument<BaseMonsterCard>[] = await MonsterCard.find(queryFilter);
        const data = docs.map(doc => doc.getInfo());

        ctx.status = 200;
        ctx.type = "application/json";
        ctx.body = { data, total: data.length };
    } catch (e) {
        const { ip, method, url } = ctx;
        loggerInstance.log(
            "error",
            `Error while handling route /search-card: ${e}`,
            { ip, method, url }
        )
        ctx.throw(500, "internal server error");
    }
}