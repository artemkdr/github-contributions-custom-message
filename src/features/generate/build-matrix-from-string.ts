import { charMatrixMap } from './char-matrix-map';

/**
 * Converts a string into a matrix representation using the charMatrixMap.
 * @param input The input string to convert (phrase or string representation of a matrix).
 * @param numRows The number of rows for the matrix.
 * @param gap The number of empty columns to add as a gap between characters.
 * @returns A 2D matrix representing the string.
 */
export const buildMatrixFromString = (input: string, numRows = 7, gap = 2): number[][] => {
    const matrix: number[][] = [];

    if (input?.startsWith('[') && input?.endsWith(']')) {
        // If the input matrix, parse it and return as a 2D array
        try {
            const parsedMatrix = JSON.parse(input);
            return parsedMatrix.map((row: (number | string)[]) =>
                row.map((col: number | string) => parseInt(col as string, 10))
            );
        } catch {
            // do nothing, work with the original input
        }
    }

    let current = 0;
    for (const char of input) {
        const charMatrix = charMatrixMap[char.toUpperCase()] || charMatrixMap[' ']; // Default to space if char not found

        for (let row = 0; row < numRows; row++) {
            if (!matrix[row]) {
                matrix[row] = [];
            }
            matrix[row] = matrix[row].concat(charMatrix[row] || []);
        }

        // Add a gap of empty columns between characters if it's not the last character
        if (current < input.length - 1) {
            for (let row = 0; row < numRows; row++) {
                matrix[row] = matrix[row].concat(Array(gap).fill(0));
            }
        }
        current++;
    }

    return matrix;
};
