import { Subject } from 'rxjs';
import { ofType } from './of-type';
import { IEvent } from '../interfaces';

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
  it('should infer return types of similar unions unions', (done) => {
    stream.pipe(ofType(A, B)).subscribe((event) => {
      event.keyAOrB;
      // @ts-expect-error -- A | B cannot reference a B only key
      event.keyBOnly;
      done();
    });

    stream.next(new A());
  });

  // TypeScript TSC test, if this compiles it passes
  it('should infer return types of disparate unions', (done) => {
    stream.pipe(ofType(A, C)).subscribe((event) => {
      // @ts-expect-error -- A | C cannot reference a key that is not on C
      event.keyAOnly;

      if (event instanceof A) {
        event.keyAOnly;
      }

      if (event instanceof C) {
        event.keyCOptional;
      }
      done();
    });

    stream.next(new A());
  });
});
