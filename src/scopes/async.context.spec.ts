import { AsyncContext } from './async.context.js';

class MyRequest extends AsyncContext {
  constructor(public readonly user: string) {
    super();
  }
}

class HeroKilledDragonEvent {}

class DropAncientItemCommand {}

describe('AsyncContext', () => {
  describe('merge()', () => {
    it('should copy the context attached to the source object', () => {
      const request = new MyRequest('alice');
      const event = new HeroKilledDragonEvent();
      const command = new DropAncientItemCommand();
      request.attachTo(event);

      AsyncContext.merge(event, command);

      expect(AsyncContext.of(command)).toBe(request);
    });

    it('should attach the source when it is an async context itself', () => {
      const request = new MyRequest('alice');
      const event = new HeroKilledDragonEvent();
      const command = new DropAncientItemCommand();
      request.attachTo(event);

      AsyncContext.merge(AsyncContext.of(event), command);

      expect(AsyncContext.of(command)).toBe(request);
    });

    it('should do nothing when the source has no context', () => {
      const event = new HeroKilledDragonEvent();
      const command = new DropAncientItemCommand();

      AsyncContext.merge(AsyncContext.of(event), command);

      expect(AsyncContext.isAttached(command)).toBe(false);
    });
  });
});
