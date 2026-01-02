import { HeroKilledDragonHandler } from './hero-killed-dragon.handler';
import { HeroFoundItemHandler } from './hero-found-item.handler';
import { DragonDiedHandler } from './dragon-died.handler';

export const EventHandlers = [
  HeroKilledDragonHandler,
  HeroFoundItemHandler,
  DragonDiedHandler,
];
