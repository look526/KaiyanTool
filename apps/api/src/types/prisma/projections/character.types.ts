export interface CharacterListItem {
  id: string;
  projectId: string;
  name: string;
  age: number | null;
  gender: string | null;
  appearance: string;
  referenceImages: string[];
  createdAt: Date;
  updatedAt: Date;
}
