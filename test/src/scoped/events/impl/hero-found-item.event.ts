export class ScopedHeroFoundItemEvent {
  constructor(
    public readonly heroId: string,
    public readonly itemId: string,
  ) {}
}
