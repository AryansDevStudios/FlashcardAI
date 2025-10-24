export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface Palace {
  id: string;
  name: string;
  flashcards: Flashcard[];
  createdAt: string;
}
