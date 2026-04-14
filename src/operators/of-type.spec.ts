import { Subject } from 'rxjs';
import { IEvent } from '../interfaces';
import { ofType } from './of-type';

describe('operators/ofType', () => {
  class A implements IEvent {
    keyAOrB: string = 'keyAOrB';
    keyAOnly: string = 'keyAOnly';
  }
  class B implements IEvent {
    keyAOrB: string = 'keyAOrB';
  }
  class SubA extends A {}
  class C implements IEvent {
    keyCOptional?: string;
  }

  let stream: Subject<any>;
  let output: IEvent[];
  let expectedResults: IEvent[];

  beforeEach(() => {
    stream = new Subject();
    output = [];
    expectedResults = [];

    stream.pipe(ofType(A)).subscribe((event) => output.push(event));
  });

  it('filters all the events when none is an instance of the given types', async () => {
    stream.next(new B());
    stream.next(new C());
    stream.next(new B());

    expect(output).toEqual([]);
  });

  it('filters instances of events to keep those of the given types', async () => {
    expectedResults.push(new A());

    stream.next(new B());
    expectedResults.forEach((event) => stream.next(event));
    stream.next(new Date());

    expect(output).toEqual(expectedResults);
  });

  it('does not filter instances of classes extending the given types', async () => {
    expectedResults.push(new A(), new SubA());

    stream.next(new B());
    expectedResults.forEach((event) => stream.next(event));

    expect(output).toEqual(expectedResults);
  });

  // TypeScript TSC test, if this compiles it passes
  it('should infer return types of similar unions unions', async () => {
    await new Promise<void>((resolve) => {
      stream.pipe(ofType(A, B)).subscribe((event) => {
        event.keyAOrB;
        // @ts-expect-error -- A | B cannot reference a B only key
        event.keyBOnly;
        resolve();
      });

      stream.next(new A());
    });
  });

  // TypeScript TSC test, if this compiles it passes
  it('should infer return types of disparate unions', async () => {
    await new Promise<void>((resolve) => {
      stream.pipe(ofType(A, C)).subscribe((event) => {
        // @ts-expect-error -- A | C cannot reference a key that is not on C
        event.keyAOnly;

        if (event instanceof A) {
          event.keyAOnly;
        }

        if (event instanceof C) {
          event.keyCOptional;
        }
        resolve();
      });

      stream.next(new A());
    });
  });
});
