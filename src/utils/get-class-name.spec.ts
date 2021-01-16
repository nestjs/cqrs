import { getClassName } from './get-class-name';

class Test {}

describe('getClassName()', () => {
  it('should return the informed instance class name', () => {
    const result = getClassName(new Test());

    expect(result).toBe('Test');
  });
});
