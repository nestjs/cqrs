import { Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { ICommand, ofType, Saga } from '../../../../src';
import { DropAncientItemCommand } from '../commands/impl/drop-ancient-item.command';
import { HeroKilledDragonEvent } from '../events/impl/hero-killed-dragon.event';

export const ANCIENT_ITEM_ID = '12456789';

@Injectable()
export class HeroesGameSagas {
  @Saga()
  dragonKilled = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(HeroKilledDragonEvent),
      delay(1000),
      map((event) => {
        Logger.debug('Inside [HeroesGameSagas] Saga');
        return new DropAncientItemCommand(event.heroId, ANCIENT_ITEM_ID);
      }),
    );
  };
}
