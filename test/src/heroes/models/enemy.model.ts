export abstract class Enemy {
  constructor(protected readonly id: string) {}
  abstract die(): void;
}
