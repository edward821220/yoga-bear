import { averageScore } from "../../src/utils/compute";

/* eslint-disable */
test("compute average score", () => {
  expect(averageScore([{ score: 1 }, { score: 2 }])).toEqual(1.5);
  expect(averageScore([{ score: 2 }, { score: 3 }])).toEqual(2.5);
  expect(averageScore([{ score: 1 }, { score: 5 }])).toEqual(3);
  expect(averageScore([{ score: 5 }, { score: 5 }])).toEqual(5);
});
