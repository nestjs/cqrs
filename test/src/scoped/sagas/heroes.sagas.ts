import { Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { AsyncContext, ICommand, ofType, Saga } from '../../../../src';
import { ScopedDropAncientItemCommand } from '../commands/impl/scoped-drop-ancient-item.command';
import { ScopedHeroKilledDragonEvent } from '../events/impl/hero-killed-dragon.event';

export const ANCIENT_ITEM_ID = '12456789';

@Injectable()
export class HeroesGameSagas {
  @Saga()
  dragonKilled = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(ScopedHeroKilledDragonEvent),
      delay(1000),
      map((event) => {
        Logger.debug('Inside [HeroesGameSagas] Saga');
        const command = new ScopedDropAncientItemCommand(
          event.heroId,
          ANCIENT_ITEM_ID,
        );
        AsyncContext.merge(event, command);
        return command;
      }),
    );
  };
}
