import { currentMatrixState } from '@/features/current-matrix-state/index.ts';
import { buildMatrixFromString } from '@/features/generate/build-matrix-from-string.ts';
import { afterEach, describe, expect, it, vi } from 'vitest';
import './main.ts';

//global.document.getElementById = mockGetElementById;

afterEach(() => {
    // cleanup matrix state
    currentMatrixState.setMatrix(null);

    // Restore the original window object after each test
    vi.unstubAllGlobals();
});

describe('main.ts', async () => {
    it('should not throw an error if all required elements are present', async () => {
        // Mock the HTML structure
        document.body.innerHTML = `
            <div id="grid-container">
                <div id="contribution-grid"></div>
            </div>            
            <input id="message-input" type="text" />
            <input id="credits-input" type="text" />
            <div id="credits"></div>
            <form id="form"></form>
            <button id="save-button">Save</button>
        `;

        // Simulate DOMContentLoaded
        expect(() => {
            document.dispatchEvent(new Event('DOMContentLoaded'));
        }).not.toThrowError();
    });

    it('should render the grid with a default value from message input', async () => {
        // Mock the HTML structure
        document.body.innerHTML = `
            <div id="grid-container">
                <div id="contribution-grid"></div>
            </div>            
            <input id="message-input" type="text" value="Hi there !!!" />
            <input id="credits-input" type="text" />
            <div id="credits"></div>
            <form id="form"></form>
            <button id="save-button">Save</button>
        `;

        document.dispatchEvent(new Event('DOMContentLoaded'));

        const matrix = currentMatrixState.getMatrix();

        // check the current matrix state, it must be built from 'Hi there' message
        expect(matrix).not.toBeNull();
        expect(matrix).toEqual(buildMatrixFromString('Hi there !!!'));

        // check the grid container
        // extract matrix from the grid container
        // compare the grid matrix with the original matrix
        expect(compareMatrices(getMatrixFromGrid(), matrix || [])).toBe(true);
    });

    it('should render the grid with a correct "value" from URL', async () => {
        // Mock the HTML structure
        document.body.innerHTML = `
            <div id="grid-container">
                <div id="contribution-grid"></div>
            </div>            
            <input id="message-input" type="text" value="Hohoho" />
            <input id="credits-input" type="text" />
            <div id="credits"></div>
            <form id="form"></form>
            <button id="save-button">Save</button>
        `;

        // Mock the URL
        const mockWindow = {
            location: {
                search: '?value=Hello%20World%20%21%21%21',
            } as Location,
            history: {
                replaceState: vi.fn(),
            } as unknown as History, // Type assertion to avoid strict type issues
        };
        // Stub the global window object with our mock
        vi.stubGlobal('window', mockWindow);

        document.dispatchEvent(new Event('DOMContentLoaded'));

        const matrix = currentMatrixState.getMatrix();

        // check the current matrix state, it must be built from 'Hello World !!!' message
        expect(matrix).not.toBeNull();
        expect(matrix).toEqual(buildMatrixFromString('Hello World !!!'));

        // check the grid container
        // compare the grid matrix with the original matrix
        expect(compareMatrices(getMatrixFromGrid(), matrix || [])).toBe(true);
    });

    it('should render the grid with a correct "matrix" from URL', async () => {
        // Mock the HTML structure
        document.body.innerHTML = `
            <div id="grid-container">
                <div id="contribution-grid"></div>
            </div>            
            <input id="message-input" type="text" value="Hohoho" />
            <input id="credits-input" type="text" />
            <div id="credits"></div>
            <form id="form"></form>
            <button id="save-button">Save</button>
        `;

        // Mock the URL
        const mockWindow = {
            location: {
                // URL-encoded matrix string: just one dot on the first row
                search: '?matrix=H4sIAAAAAAAAA4uONtAhFRqSrAMMY3XIsItMOGrXqF047YoFABGkD4H1AgAA',
            } as Location,
            history: {
                replaceState: vi.fn(),
            } as unknown as History, // Type assertion to avoid strict type issues
        };
        // Stub the global window object with our mock
        vi.stubGlobal('window', mockWindow);

        document.dispatchEvent(new Event('DOMContentLoaded'));

        const matrix = currentMatrixState.getMatrix();

        // check the current matrix state, it must be built from 'Hello World !!!' message
        expect(matrix).not.toBeNull();
        expect(compareMatrices(matrix || [], [[1], [0], [0], [0], [0], [0], [0]])).toBe(true);

        // check the grid container
        // compare the grid matrix with the original matrix
        expect(compareMatrices(getMatrixFromGrid(), matrix || [])).toBe(true);
    });
});

// helper to build matrix from grid
const getMatrixFromGrid = () => {
    const squares = document.querySelectorAll('#contribution-grid .square');
    const gridMatrix: number[][] = [];
    squares.forEach((square) => {
        const rowIndex = parseInt(square.getAttribute('data-row') as string, 10);
        const colIndex = parseInt(square.getAttribute('data-col') as string, 10);
        const val = parseInt(square.getAttribute('data-value') as string, 10);
        if (gridMatrix[rowIndex] === undefined) {
            gridMatrix[rowIndex] = [];
        }
        gridMatrix[rowIndex][colIndex] = val;
    });
    return gridMatrix;
};

// helper to compare two matrices exlucding columns with all 0s, i.e. all paddings and gaps
const compareMatrices = (matrix1: number[][], matrix2: number[][]) => {
    const nozeroMatrix1 = removeEmptyColumns(matrix1);
    const nozeroMatrix2 = removeEmptyColumns(matrix2);

    // Compare the trimmed matrices
    return JSON.stringify(nozeroMatrix1) === JSON.stringify(nozeroMatrix2);
};

// Remove empty columns from both matrices
const removeEmptyColumns = (matrix: number[][]) => {
    const nonEmptyColumns = new Set<number>();

    matrix.forEach((row) => {
        row.forEach((value, colIndex) => {
            if (value !== 0) {
                nonEmptyColumns.add(colIndex);
            }
        });
    });

    return matrix.map((row) => row.filter((_, colIndex) => nonEmptyColumns.has(colIndex)));
};
