import { add } from '../src/utils';

describe('testing index file', () => {
    test('empty string should result in zero', () => {
        expect(add(1, 2)).toBe(3);
    });
});
