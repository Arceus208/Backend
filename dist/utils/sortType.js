"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortType = exports.getSortParams = void 0;
const getSortParams = (sort) => {
    if (sort === "priceInc") {
        return ["curPrice", "asc"];
    }
    if (sort === "priceDesc") {
        return ["curPrice", "desc"];
    }
    if (sort === "bestSelling") {
        return ["unitSold", "desc"];
    }
    if (sort === "newProduct") {
        return ["createAt", "desc"];
    }
    return ["createAt", "desc"];
};
exports.getSortParams = getSortParams;
exports.sortType = ["priceInc", "priceDesc", "bestSelling", "newProduct"];
//# sourceMappingURL=sortType.js.map