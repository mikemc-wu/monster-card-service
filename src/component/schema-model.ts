import { Schema, model } from "mongoose";
import { cardCollection } from "../config.ts";

export interface BaseMonsterCard {
    _id: Schema.Types.ObjectId,
    monster: string,
    type: string,
    card: string,
    year: number,
    grade: number,
    image: string,
    auctionUrl: string,
    price: number,
    createdAt: Date,
    updatedAt: Date,
    getInfo(): object,
}

export const minYear = 1990;
export const searchableKeys = ["monster", "type", "grade", "year", "card"];
export const sortableKeys = ["monster", "type", "grade", "year", "price"];
export const monsters = ["gravelclaw", "snarlfang", "mudgnasher", "burrowbeast", "howlhorn", "stonepelt", "rusthide", "cragtusk", "furback", "stalkmaw", "stormjaw", "thundrak", "voltmaw", "cracklash", "skystormer", "electroclaw", "zephyron", "shockhorn", "boltgore", "tempestrix", "pyroscourge", "glaciator", "volcrag", "emberfang", "frostmaul", "terraxyl", "droughtfiend", "thornbrood", "miremaw", "aeroslither", "abysskraken", "kelpyrix", "brinefiend", "morathuun", "drownspawn", "tidal reaver", "salthorror", "deepfang", "charynth", "leviacrest", "ironmaw", "wargrith", "titanox", "cragthul", "ragehorn", "blightcrush", "gravemarch", "brutalisk", "mightclad", "smashgul", "spellmaw", "arcansoul", "mysthorn", "chronoghul", "glyphshade", "hexlurker", "manafiend", "runeborn", "sorcarok", "voidchant", "xelvharn", "ygnoth", "dreadwail", "whisperspine", "skinharrow", "oozorath", "hollowone", "facelessgrin", "nyxmaw", "grimveil", "bonehowler", "corpsemire", "skuldrith", "necroth", "wraithclaw", "gravecinder", "cryptgnaw", "ghoulmantle", "mournshade", "rotknight", "drakzul", "volgarax", "cindervyre", "frostwyrm", "thal'zuur", "stormdrake", "ashglide", "embercoil", "darkwynn", "zephyrosk", "fadewalker", "mirrormaw", "veilshard", "phantaziel", "whisperveil", "gloomscreech", "mindflicker", "shimmerskin", "obscureon", "dreamsplit"];
export const monsterTypes = ["normal", "thunder", "elemental", "aquatic", "power", "magic", "horror", "undead", "dragon", "illusion"];
export const cardGrades = [0, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const cardYears = ["-2000", "2000-2010", "2010-2020", "2020+"];
export const cardPrices = ["<$20", "$20-$50", "$50-$100", "$100-$200", ">$200"];
export const MonsterCardSchema = new Schema<BaseMonsterCard>({
    monster: {
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        index: true
    },
    card: {
        type: String,
        required: true,
        index: true
    },
    year: {
        type: Number,
        required: true,
        index: true
    },
    grade: {
        type: Number,
        required: true,
        index: true
    },
    image: {
        type: String,
        required: true,
    },
    auctionUrl: {
        type: String
    },
    price: {
        type: Number,
        required: true,
        index: true
    }
}, {
    methods: {
        getInfo() {
            return {
                monster: this.monster,
                type: this.type,
                card: this.card,
                year: this.year,
                grade: this.grade,
                image: this.image,
                auctionUrl: this.auctionUrl,
                price: this.price
            };
        }
    },
    timestamps: true
});
export const MonsterCard = model("MonsterCard", MonsterCardSchema, cardCollection);