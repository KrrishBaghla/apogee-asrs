import { describe, expect, it } from "vitest";
import { currentLevelIndex, levelStatuses, totalSteps, type Level } from "../lib/progress";

const levels: Level[] = [
  { id: "one", level: 1, title: "One", stepIds: ["a", "b"] },
  { id: "two", level: 2, title: "Two", stepIds: ["c"] },
  { id: "three", level: 3, title: "Three", stepIds: ["d"] },
];

const unlocked = (done: string[]) => levelStatuses(levels, done).map((status) => status.unlocked);

describe("unlocking", () => {
  it("opens only level 1 at the start", () => {
    expect(unlocked([])).toEqual([true, false, false]);
  });

  it("keeps the next level locked until every step is ticked", () => {
    expect(unlocked(["a"])).toEqual([true, false, false]);
    expect(unlocked(["a", "b"])).toEqual([true, true, false]);
  });

  it("locks later levels again when a step is unticked, and keeps their ticks", () => {
    const statuses = levelStatuses(levels, ["a", "c"]);
    expect(statuses.map((status) => status.unlocked)).toEqual([true, false, false]);
    expect(statuses[1]).toMatchObject({ done: 1, complete: true });
  });

  it("never treats a level with no steps as finished", () => {
    const empty: Level[] = [
      { id: "x", level: 1, title: "X", stepIds: [] },
      { id: "y", level: 2, title: "Y", stepIds: ["e"] },
    ];
    expect(levelStatuses(empty, []).map((status) => status.unlocked)).toEqual([true, false]);
  });

  it("ignores ticks from other domains", () => {
    expect(totalSteps(levelStatuses(levels, ["a", "other"]))).toEqual({ done: 1, total: 4 });
  });
});

describe("current level", () => {
  it("is the first unfinished level", () => {
    expect(currentLevelIndex(levelStatuses(levels, ["a", "b"]))).toBe(1);
  });

  it("stays on the last level once everything is finished", () => {
    expect(currentLevelIndex(levelStatuses(levels, ["a", "b", "c", "d"]))).toBe(2);
  });
});
