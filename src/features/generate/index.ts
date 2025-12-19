// Extracted helper function for speed normalization
const normalizeSpeed = (speed: number) => Math.max(0, Math.min(10, speed)) / 1000;

interface GenerateContributionGridOptions {
    input: number[][]; // Input matrix of 0s and 1s
    gridContainer: HTMLElement; // Main container for the grid
    contributionsGrid: HTMLElement; // Grid element where contributions are displayed
    creditsContainer: HTMLElement; // Container for displaying credits
    speed?: number; // Animation speed
    paddingX?: number; // Horizontal padding for the grid
    paddingY?: number; // Vertical padding for the grid
    creditsValue?: string; // Credits text input
    numRows?: number; // Number of rows in the grid
    gridGap?: string; // Gap between squares in the grid
    fillEmptySquares?: boolean; // Flag to fill empty squares with random low contrast color
    animationDuration?: number; // Duration of the animation for each square in seconds
    maxInputLength?: number; // Maximum length of the input message (in columns)
    minInputLength?: number; // Minimum length of the input message (in columns)
    squareClassName?: string; // Class name for each square
    squareLevelClassName?: string; // Template of class name for the level of each square: level-{level}
    valueAttrName?: string; // Attribute name for the value of each square
    colAttrName?: string; // Attribute name for the column index of each square
    rowAttrName?: string; // Attribute name for the row index of each square
}

export const generateContributionGrid = (options: GenerateContributionGridOptions) => {
    const {
        gridContainer,
        contributionsGrid,
        creditsContainer,
        input,
        creditsValue = 'github.artem.work',
        speed = 3,
        paddingX = 20,
        paddingY = 20,
        numRows = 7,
        gridGap = '0.625rem',
        fillEmptySquares = true,
        animationDuration = 0.5,
        maxInputLength = 100,
        minInputLength = 53,
        squareClassName = 'square',
        squareLevelClassName = 'level-{level}',
        valueAttrName = 'data-value',
        colAttrName = 'data-col',
        rowAttrName = 'data-row',
    } = options;

    const speedFactor = normalizeSpeed(speed); // Normalize speed using helper function

    creditsContainer.innerHTML = creditsValue; // Update credits text
    creditsContainer.style.display = creditsValue ? 'block' : 'none'; // Show or hide credits based on input

    // Set grid container padding based on user input
    Object.assign(gridContainer.style, {
        paddingLeft: `${paddingX}px`,
        paddingRight: `${paddingX}px`,
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`,
    });

    // Ensure the matrix meets the required column length
    const matrixWidth = input[0]?.length || 0;
    let adjustedMatrix = input;
    if (adjustedMatrix.length == 0) {
        adjustedMatrix = Array.from({ length: numRows }, () => Array(1).fill(0)); // Default to a single column if input is empty
    }

    if (matrixWidth < minInputLength) {
        // Pad the matrix with empty columns (0)
        const padding = Array.from({ length: Math.floor(0.5 * (minInputLength - matrixWidth)) }, () => 0);
        adjustedMatrix = adjustedMatrix.map((row) => [...padding, ...row, ...padding]);
    } else if (matrixWidth > maxInputLength) {
        // Trim the matrix to the maximum allowed columns
        adjustedMatrix = adjustedMatrix.map((row) => row.slice(0, maxInputLength));
    }

    // check if the number of rows is less than numRows and pad with empty rows (0)
    if (adjustedMatrix.length < numRows) {
        const padding = Array.from({ length: numRows - adjustedMatrix.length }, () =>
            Array(adjustedMatrix[0].length).fill(0)
        );
        adjustedMatrix = [...adjustedMatrix, ...padding];
    }

    contributionsGrid.innerHTML = ''; // Clear previous grid

    // Set grid styles based on calculated values
    Object.assign(contributionsGrid.style, {
        gridTemplateRows: `repeat(${numRows}, ${gridGap})`, // Set grid row template
        gridTemplateColumns: `repeat(${adjustedMatrix[0].length}, ${gridGap})`, // Set grid column template
    });

    let animationDelay = 0;
    // Draw the matrix
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < adjustedMatrix[0].length; col++) {
            const square = document.createElement('div'); // Create a square element
            square.classList.add(squareClassName);
            square.style.animationDuration = `${speedFactor == 0 ? 0 : animationDuration}s`; // Set animation duration
            square.style.animationDelay = `${animationDelay}s`; // Set animation delay
            animationDelay += speedFactor; // Increment delay for staggered effect
            square.setAttribute('draggable', 'false'); // Prevent dragging of squares
            square.setAttribute(rowAttrName, row.toString()); // Set data attributes for row and column
            square.setAttribute(colAttrName, col.toString()); // Set data attributes for row and column
            square.setAttribute(valueAttrName, adjustedMatrix[row][col].toString()); // Set data attribute for value

            // Assign level based on matrix value
            if (adjustedMatrix[row][col] === 1) {
                square.classList.add(
                    squareLevelClassName.replace('{level}', (3 + Math.floor(Math.random() * 2)).toString())
                ); // Higher level for 1
            } else {
                square.classList.add(
                    squareLevelClassName.replace(
                        '{level}',
                        (fillEmptySquares ? Math.floor(Math.random() * 2) : 0).toString()
                    )
                ); // Lower level for 0
            }

            contributionsGrid.appendChild(square); // Add square to the grid
        }
    }

    generateLabels({
        dayLabelsContainer: gridContainer.querySelector('#day-labels') as HTMLElement, // Get the day labels container
        monthLabelsContainer: gridContainer.querySelector('#month-labels') as HTMLElement, // Get the month labels container
    });
};

const generateLabels = ({
    dayLabels = ['Mon', 'Wed', 'Fri'], // Default labels for days
    monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], // Default labels for months
    dayLabelsContainer,
    monthLabelsContainer,
}: {
    dayLabels?: string[]; // Optional custom labels for days
    monthLabels?: string[]; // Optional custom labels for months
    dayLabelsContainer?: HTMLElement; // Optional container for day labels
    monthLabelsContainer?: HTMLElement; // Optional container for month labels
}) => {
    const currentMonth = new Date().getMonth(); // Get the current month index
    if (dayLabelsContainer && monthLabelsContainer) {
        dayLabelsContainer.innerHTML = dayLabels.map((day) => `<div class="day-label">${day}</div>`).join(''); // Generate day labels
        monthLabelsContainer.innerHTML = Array.from({ length: 12 }, (_, i) => {
            const month = monthLabels[(currentMonth + i) % 12]; // Calculate month label based on current month
            return `<div class="month-label">${month}</div>`;
        }).join(''); // Generate month labels
    }
};
