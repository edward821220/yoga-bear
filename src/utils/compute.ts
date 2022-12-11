export const averageScore = (arr: { score: number }[]) => arr.reduce((acc, cur) => acc + cur.score, 0) / arr.length;
