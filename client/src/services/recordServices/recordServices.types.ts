interface IRecord {
  _id?: string;
  user?: string;
  date: number;
  measurements: {
    weight: number | null;
    neck: number | null;
    shoulders: number | null;
    chest: number | null;
    arms: number | null;
    forearms: number | null;
    waist: number | null;
    hips: number | null;
    thighs: number | null;
    calves: number | null;
  };
}

export type { IRecord };
