import { buildMatrixFromString } from '@/features/generate/build-matrix-from-string';

export const debounce = (func: (event: Event) => void, delay: number) => {
    let timeoutId: number | undefined;
    return (event: Event) => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => func(event), delay);
    };
};

export const captureGridToMatrix = (squaresSelector = '#contribution-grid .square') => {
    const colAttrName = 'data-col';
    const rowAttrName = 'data-row';
    const valueAttrName = 'data-value';
    const squares = document.querySelectorAll(squaresSelector);
    const array: number[][] = [];
    squares.forEach((square) => {
        if (square.getAttribute(colAttrName) === null || square.getAttribute(rowAttrName) === null) {
            return;
        }
        const rowIndex = parseInt(square.getAttribute(rowAttrName) as string, 10);
        const colIndex = parseInt(square.getAttribute(colAttrName) as string, 10);
        const val = parseInt(square.getAttribute(valueAttrName) as string, 10);
        if (array[rowIndex] === undefined) {
            array[rowIndex] = [];
        }
        array[rowIndex][colIndex] = val;
    });
    return array;
};

export const centerGridWrapper = () => {
    const gridWrapper = document.getElementById('grid-wrapper');
    if (gridWrapper) {
        gridWrapper.scrollTo({
            left: (gridWrapper.scrollWidth - gridWrapper.clientWidth) / 2,
            behavior: 'smooth',
        });
    }
};

export const getGeneratorOptions = () => {
    return {
        input: buildMatrixFromString(
            (document.getElementById('message-input') as HTMLInputElement).value.toUpperCase()
        ),
        squaresClassName: 'square',
        squaresLevelClassName: 'level-{level}',
        valueAttrName: 'data-value',
        colAttrName: 'data-col',
        rowAttrName: 'data-row',
        gridContainer: document.getElementById('grid-container') as HTMLElement,
        contributionsGrid: document.getElementById('contribution-grid') as HTMLElement,
        speed: parseInt((document.getElementById('speed-input') as HTMLInputElement)?.value),
        paddingX: parseInt((document.getElementById('padding-x-input') as HTMLInputElement)?.value),
        paddingY: parseInt((document.getElementById('padding-y-input') as HTMLInputElement)?.value),
        fillEmptySquares: (document.getElementById('fill-empty-squares-input') as HTMLInputElement)?.checked,
        creditsValue: (document.getElementById('credits-input') as HTMLInputElement).value,
        creditsContainer: document.getElementById('credits') as HTMLElement,
    };
};
