export const clearGrid = ({
    contributionsGrid,
    fillEmptySquares = true,
    squareClassName = 'square',
    squareLevelClassName = 'level-{level}',
    valueAttrName = 'data-value',
}: {
    contributionsGrid: HTMLElement;
    fillEmptySquares?: boolean;
    squareClassName?: string;
    squareLevelClassName?: string;
    valueAttrName?: string;
}) => {
    const squares = contributionsGrid.querySelectorAll(`.${squareClassName}`);
    squares.forEach((square) => {
        square.className = `${squareClassName} ${squareLevelClassName.replace('{level}', (fillEmptySquares ? Math.floor(Math.random() * 2) : 0).toString())}`; // Reset class name)`;
        square.setAttribute(valueAttrName, '0');
    });
};
