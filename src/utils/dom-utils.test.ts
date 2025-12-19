import { describe, expect, it, vi } from 'vitest';
import { captureGridToMatrix, centerGridWrapper, debounce, getGeneratorOptions } from './dom-utils';

describe('debounce', () => {
    it('should delay the execution of the function', () => {
        vi.useFakeTimers();
        const mockFn = vi.fn();
        const debouncedFn = debounce(mockFn, 200);

        debouncedFn(new Event('test'));
        expect(mockFn).not.toHaveBeenCalled();

        vi.advanceTimersByTime(200);
        expect(mockFn).toHaveBeenCalledOnce();

        vi.useRealTimers();
    });
});

describe('captureGridToMatrix', () => {
    it('should capture grid data into a matrix', () => {
        document.body.innerHTML = `
            <div id="contribution-grid">
                <div class="square" data-row="0" data-col="0" data-value="1"></div>
                <div class="square" data-row="0" data-col="1" data-value="2"></div>
                <div class="square" data-row="1" data-col="0" data-value="3"></div>
                <div class="square" data-row="1" data-col="1" data-value="4"></div>
            </div>
        `;

        const matrix = captureGridToMatrix();
        expect(matrix).toEqual([
            [1, 2],
            [3, 4],
        ]);
    });
});

describe('centerGridWrapper', () => {
    it('should scroll the grid wrapper to the center', () => {
        const mockScrollTo = vi.fn();
        document.body.innerHTML = '<div id="grid-wrapper" style="width: 100px; overflow: auto;"></div>';
        const gridWrapper = document.getElementById('grid-wrapper');
        if (gridWrapper) {
            Object.defineProperty(gridWrapper, 'scrollWidth', { value: 300, writable: true });
            Object.defineProperty(gridWrapper, 'clientWidth', { value: 100, writable: true });
            gridWrapper.scrollTo = mockScrollTo;
        }

        centerGridWrapper();
        expect(mockScrollTo).toHaveBeenCalledWith({
            left: 100,
            behavior: 'smooth',
        });
    });
});

describe('getGeneratorOptions', () => {
    it('should return generator options based on DOM elements', () => {
        document.body.innerHTML = `
            <input id="message-input" value="test" />
            <input id="speed-input" value="5" />
            <input id="padding-x-input" value="10" />
            <input id="padding-y-input" value="15" />
            <input id="fill-empty-squares-input" type="checkbox" checked />
            <input id="credits-input" value="credits" />
            <div id="grid-container"></div>
            <div id="contribution-grid"></div>
            <div id="credits"></div>
        `;

        const options = getGeneratorOptions();
        expect(options).toEqual({
            input: expect.any(Array),
            squaresClassName: 'square',
            squaresLevelClassName: 'level-{level}',
            valueAttrName: 'data-value',
            colAttrName: 'data-col',
            rowAttrName: 'data-row',
            gridContainer: expect.any(HTMLElement),
            contributionsGrid: expect.any(HTMLElement),
            speed: 5,
            paddingX: 10,
            paddingY: 15,
            fillEmptySquares: true,
            creditsValue: 'credits',
            creditsContainer: expect.any(HTMLElement),
        });
    });
});
