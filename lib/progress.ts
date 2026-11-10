export type Progress = { domain: string | null; done: string[] };

export type Level = {
  id: string;
  level: number;
  title: string;
  stepIds: string[];
};

export type LevelStatus = {
  done: number;
  total: number;
  complete: boolean;
  unlocked: boolean;
};

export const emptyProgress: Progress = { domain: null, done: [] };

// Level 1 is always open. Every later level needs all the levels before it finished,
// so unticking a step locks what follows but keeps the ticks saved there.
export function levelStatuses(levels: Level[], done: string[]): LevelStatus[] {
  const ticked = new Set(done);
  let unlocked = true;

  return levels.map((level) => {
    const count = level.stepIds.filter((id) => ticked.has(id)).length;
    const complete = level.stepIds.length > 0 && count === level.stepIds.length;
    const status = { done: count, total: level.stepIds.length, complete, unlocked };
    unlocked = unlocked && complete;
    return status;
  });
}

// The level to work on next: the first one not finished, or the last if all are.
export function currentLevelIndex(statuses: LevelStatus[]): number {
  const index = statuses.findIndex((status) => !status.complete);
  return index === -1 ? statuses.length - 1 : index;
}

export function totalSteps(statuses: LevelStatus[]): { done: number; total: number } {
  return statuses.reduce(
    (sum, status) => ({ done: sum.done + status.done, total: sum.total + status.total }),
    { done: 0, total: 0 },
  );
}
