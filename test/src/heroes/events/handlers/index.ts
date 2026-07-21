import { HeroKilledDragonHandler } from './hero-killed-dragon.handler.js';
import { HeroFoundItemHandler } from './hero-found-item.handler.js';
import { DragonDiedHandler } from './dragon-died.handler.js';

export const EventHandlers = [
  HeroKilledDragonHandler,
  HeroFoundItemHandler,
  DragonDiedHandler,
];
