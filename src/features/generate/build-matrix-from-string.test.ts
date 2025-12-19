import { describe, expect, it } from 'vitest';
import { buildMatrixFromString } from './build-matrix-from-string';

describe('buildMatrixFromPhrase', () => {
    it('should convert a phrase into a matrix representation', () => {
        const phrase = 'A';
        const result = buildMatrixFromString(phrase);
        expect(result).toBeDefined();
        expect(result.length).toBe(7); // Default numRows is 7
    });

    it('should handle phrases with special characters', () => {
        const phrase = 'A B';
        const result = buildMatrixFromString(phrase, 7, 2);
        expect(result).toBeDefined();
        expect(result[0].length).toBe(16); // Ensure matrix has content
    });

    it('should parse a valid matrix string', () => {
        const phrase = '[[1,0],[0,1]]';
        const result = buildMatrixFromString(phrase);
        expect(result).toEqual([
            [1, 0],
            [0, 1],
        ]);
    });

    it('should return an empty matrix for an empty phrase', () => {
        const phrase = '';
        const result = buildMatrixFromString(phrase);
        expect(result).toEqual([]);
    });

    it('should add gaps between characters', () => {
        const phrase = 'ABC';
        const result = buildMatrixFromString(phrase, 7, 4);
        expect(result[0].length).toBe(23); // Ensure gaps of 4 are added
    });
});
