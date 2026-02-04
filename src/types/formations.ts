export type FormationCategory = "offensive" | "defensive";

export interface Formation {
  id: string;
  name: string;
  category: FormationCategory;
  description: string;
}