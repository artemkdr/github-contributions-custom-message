import { describe, expect, it } from 'vitest';
import { decodeMatrix, encodeMatrix } from './matrix-serializer';

// Sample test cases
describe('matrix-serializer', () => {
    it('should encode and decode a matrix correctly', () => {
        const matrix = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
        ];
        const encoded = encodeMatrix(matrix);
        const decoded = decodeMatrix(encoded);
        expect(decoded).toEqual(matrix);
    });

    it('should return an empty array for invalid encoded data', () => {
        const invalidEncodedData = 'invalid-data';
        const decoded = decodeMatrix(invalidEncodedData);

        expect(decoded).toEqual([]);
    });

    it('should return an empty array for empty string', () => {
        const invalidEncodedData = '';
        const decoded = decodeMatrix(invalidEncodedData);

        expect(decoded).toEqual([]);
    });
});
