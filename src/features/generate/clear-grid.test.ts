import { beforeEach, describe, expect, it } from 'vitest';
import { clearGrid } from './clear-grid';

describe('clearGrid', () => {
    let contributionsGrid: HTMLElement;

    beforeEach(() => {
        // Set up a mock grid element
        contributionsGrid = document.createElement('div');
        contributionsGrid.innerHTML = `
            <div class="square level-1" data-value="1"></div>
            <div class="square level-2" data-value="2"></div>
            <div class="square level-3" data-value="3"></div>
        `;
    });

    it('should clear all squares and reset their attributes', () => {
        clearGrid({ contributionsGrid });

        const squares = contributionsGrid.querySelectorAll('.square');
        squares.forEach((square) => {
            expect(square.className).toMatch(/square level-[01]/); // Default fillEmptySquares is true
            expect(square.getAttribute('data-value')).toBe('0');
        });
    });

    it('should set all squares to level-0 when fillEmptySquares is false', () => {
        clearGrid({ contributionsGrid, fillEmptySquares: false });

        const squares = contributionsGrid.querySelectorAll('.square');
        squares.forEach((square) => {
            expect(square.className).toBe('square level-0');
            expect(square.getAttribute('data-value')).toBe('0');
        });
    });

    it('should use custom class and attribute names if provided', () => {
        clearGrid({
            contributionsGrid,
            squareClassName: 'custom-square',
            squareLevelClassName: 'custom-level-{level}',
            valueAttrName: 'custom-value',
        });

        const squares = contributionsGrid.querySelectorAll('.custom-square');
        squares.forEach((square) => {
            expect(square.className).toMatch(/custom-square custom-level-[01]/);
            expect(square.getAttribute('custom-value')).toBe('0');
        });
    });
});
