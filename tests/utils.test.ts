import { toUID, toGID, toNumber } from '../src/utils';

describe('Utils', () => {
    describe('toNumber', () => {
        it('should convert a number starting with 0 to include country code', () => {
            process.env.COUNTRY_CODE = '1';
            const result = toNumber('0123456789');
            expect(result).toBe('1123456789');
        });

        it('should remove "@" and everything after it', () => {
            const result = toNumber('123456789@c.us');
            expect(result).toBe('123456789');
        });

        it('should remove leading "+"', () => {
            const result = toNumber('+123456789');
            expect(result).toBe('123456789');
        });
    });

    describe('toUID', () => {
        it('should convert a number to a user ID', () => {
            process.env.COUNTRY_CODE = '1';
            const result = toUID('0123456789');
            expect(result).toBe('1123456789@c.us');
        });

        it('should add "@c.us" if not present', () => {
            const result = toUID('123456789');
            expect(result).toBe('123456789@c.us');
        });

        it('should remove leading "+"', () => {
            const result = toUID('+123456789');
            expect(result).toBe('123456789@c.us');
        });
    });

    describe('toGID', () => {
        it('should convert a number to a group ID', () => {
            process.env.COUNTRY_CODE = '1';
            const result = toGID('0123456789');
            expect(result).toBe('1123456789@g.us');
        });

        it('should add "@g.us" if not present', () => {
            const result = toGID('123456789');
            expect(result).toBe('123456789@g.us');
        });

        it('should remove leading "+"', () => {
            const result = toGID('+123456789');
            expect(result).toBe('123456789@g.us');
        });
    });
});
