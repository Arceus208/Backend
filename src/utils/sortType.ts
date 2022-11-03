export const getSortParams = (sort: string) => {
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

export const sortType = ["priceInc", "priceDesc", "bestSelling", "newProduct"];
