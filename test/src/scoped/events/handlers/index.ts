import { ScopedHeroFoundItemHandler } from './scoped-hero-found-item.handler.js';
import { ScopedHeroKilledDragonHandler } from './scoped-hero-killed-dragon.handler.js';

export const EventHandlers = [
  ScopedHeroKilledDragonHandler,
  ScopedHeroFoundItemHandler,
];
