import { currentMatrixState } from '@/features/current-matrix-state';
import { activateDrawMode, deactivateDrawMode } from '@/features/draw/index';
import { saveContributionGridAsImage } from '@/features/export/to-image';
import { clearGrid } from '@/features/generate/clear-grid';
import { generateContributionGrid } from '@/features/generate/index';
import { matrixMap } from '@/features/generate/matrices-collection';
import { shareContributionGrid } from '@/features/share';
import { getValueFromURL, setValueInURL } from '@/features/value-from-url';
import { captureGridToMatrix, centerGridWrapper, debounce, getGeneratorOptions } from '@/utils/dom-utils';
import { decodeMatrix, encodeMatrix } from '@/utils/matrix-serializer';
import { sanitizeInput } from '@/utils/sanitizer';

// inject vercel insights (analytics) script if run on Vercel
// VITE_IS_VERCEL is set in the Vercel project settings
if (import.meta.env.VITE_IS_VERCEL === 'true') {
    const script = document.createElement('script');
    script.defer = true;
    script.src = '/_vercel/insights/script.js';
    document.head.appendChild(script);
}

const setupThemeToggle = () => {
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle?.addEventListener('click', () => {
        const html = document.documentElement;
        html.setAttribute('theme', html.getAttribute('theme') === 'dark' ? 'light' : 'dark');
    });
};

const setupSaveButton = () => {
    const saveButton = document.getElementById('save-button') as HTMLButtonElement;
    const messageInput = document.getElementById('message-input') as HTMLInputElement;

    saveButton.addEventListener('click', () =>
        saveContributionGridAsImage({
            gridContainer: document.getElementById('grid-container') as HTMLElement,
            saveButton: saveButton,
            fileName: `contribution-grid-${messageInput.value.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`,
        })
    );
};

// fill-empty-squares-input checkox is used to define
// whether to fill empty squares with a random low level value or leave them empty
// it's checked by default, but can be read from URL
const setupFillEmptySquaresInput = () => {
    const fillEmptySquaresInput = document.getElementById('fill-empty-squares-input') as HTMLInputElement;
    if (fillEmptySquaresInput) {
        fillEmptySquaresInput.addEventListener('change', () => {
            const fillEmptySquares = fillEmptySquaresInput.checked;
            setValueInURL('fillemptysquares', fillEmptySquares ? 'true' : 'false');
        });

        const fillEmptySquaresFromUrl = getValueFromURL('fillemptysquares');
        if (fillEmptySquaresFromUrl) {
            fillEmptySquaresInput.checked = fillEmptySquaresFromUrl === 'true';
        }
    }
};

// activate or deactivate draw mode on the grid
// once in draw mode:
// update current matrix state on grid painted event
// and update the URL with the matrix value
const setupDrawModeInput = () => {
    const drawMode = document.getElementById('draw-mode-input') as HTMLInputElement;
    const contributionGrid = document.getElementById('contribution-grid') as HTMLElement;
    const debouncedSetValueInURL = debounce(() => {
        setValueInURL('matrix', encodeMatrix(currentMatrixState.getMatrix() || []));
    }, 500);
    const gridPaintedHandler = (event: Event) => {
        const customEvent = event as CustomEvent;
        if (customEvent && customEvent.type === 'painted' && customEvent.detail && customEvent.detail.square) {
            const selector = '#contribution-grid .square';
            const squares = document.querySelectorAll(selector);
            // if currentMatrix has the same size as the grid, we can update only painted square
            const currentMatrix = currentMatrixState.getMatrix();
            if (
                currentMatrix &&
                currentMatrix.length > 0 &&
                squares.length === currentMatrix.length * currentMatrix[0].length
            ) {
                const square = customEvent.detail.square as HTMLElement;
                if (!square) return;
                const rowIndex = parseInt(square.getAttribute('data-row') as string, 10);
                const colIndex = parseInt(square.getAttribute('data-col') as string, 10);
                const value = parseInt(square.getAttribute('data-value') as string, 10);
                currentMatrixState.updateMatrix(rowIndex, colIndex, value);
            } else {
                // otherwise we need to update the whole grid
                currentMatrixState.setMatrix(captureGridToMatrix(selector));
            }
            debouncedSetValueInURL(event); // debounce to avoid too many updates in URL
        }
    };

    drawMode?.addEventListener('change', (event) => {
        if ((event.target as HTMLInputElement).checked) {
            activateDrawMode(contributionGrid);
            contributionGrid.addEventListener('painted', gridPaintedHandler);
        } else {
            deactivateDrawMode(contributionGrid);
            contributionGrid.removeEventListener('painted', gridPaintedHandler);
        }
    });
};

// the buttons clears the grid and resets the matrix state
const setupClearButton = () => {
    const clearButton = document.getElementById('clear-button');
    clearButton?.addEventListener('click', () => {
        clearGrid({
            contributionsGrid: document.getElementById('contribution-grid') as HTMLElement,
            fillEmptySquares: (document.getElementById('fill-empty-squares-input') as HTMLInputElement)?.checked,
            squareClassName: 'square',
            squareLevelClassName: 'level-{level}',
            valueAttrName: 'data-value',
        });
        currentMatrixState.resetMatrix();
        setValueInURL('matrix', null);
    });
};

// everything is wrapped in a form to allow for easy submission (but to prevent default behavior)
const setupForm = () => {
    const form = document.getElementById('form');
    form?.addEventListener('submit', (event) => {
        event.preventDefault();
        updateGrid();
        centerGridWrapper();
    });
};

// share as an image or a link buttons
const setupShareButtons = () => {
    const gridContainer = document.getElementById('grid-container') as HTMLElement;
    const shareImageButton = document.getElementById('share-image-button');
    shareImageButton?.addEventListener('click', async () => {
        shareContributionGrid({
            gridContainer: gridContainer,
            button: shareImageButton as HTMLButtonElement,
            fileName: `contribution-grid-${sanitizeInput((document.getElementById('message-input') as HTMLInputElement).value.toLowerCase().replace(/[^a-z0-9]/g, ''))}.png`,
        });
    });

    const shareLinkButton = document.getElementById('share-link-button');
    shareLinkButton?.addEventListener('click', async () => {
        shareContributionGrid({
            gridContainer: gridContainer,
            button: shareLinkButton as HTMLButtonElement,
        });
    });
};

// add handlers for all inputs in the form at once
const setupInputChangeHandlers = () => {
    const inputs = [
        'message-input',
        'speed-input',
        'padding-x-input',
        'padding-y-input',
        'credits-input',
        'fill-empty-squares-input',
    ];
    const inputChangeHandler = debounce((event: Event) => {
        if ((event.target as HTMLInputElement)?.id === 'message-input') {
            currentMatrixState.resetMatrix();
        }
        updateGrid();
        centerGridWrapper();
    }, 500);
    inputs.forEach((inputId) => {
        const input = document.getElementById(inputId) as HTMLInputElement;
        input?.addEventListener('input', inputChangeHandler);
    });
};

// these are buttons with predefined matrices to draw from (like heart, smiley, etc.)
// the button has to have a data-matrix attribute with the name of the matrix in the matrixMap module
const setupMatricesButtons = () => {
    const matricesButtons = document.querySelectorAll('button[data-matrix]');
    matricesButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const matrixName = (button as HTMLButtonElement).getAttribute('data-matrix') as string;
            if (matrixName && matrixMap[matrixName]) {
                updateGrid({
                    input: matrixMap[matrixName],
                });
                centerGridWrapper();
            }
        });
    });
};

// set initial value from URL
const setupInitialValue = () => {
    const messageInput = document.getElementById('message-input') as HTMLInputElement;
    if (messageInput) {
        const urlValue = getValueFromURL('value');
        if (typeof urlValue === 'string') {
            const messageFromUrl = sanitizeInput(urlValue);
            if (messageFromUrl) messageInput.value = messageFromUrl;
        }
    }
};

// decode the matrix from the URL and set it as the current matrix state
const setupInitialMatrix = () => {
    const matrixFromUrl = getValueFromURL('matrix');
    const matrix = decodeMatrix(matrixFromUrl as string);
    if (matrix && Array.isArray(matrix) && matrix.length > 0) {
        currentMatrixState.setMatrix(matrix);
    }
};

// Initialize the controls and event listeners
const initialize = () => {
    setupThemeToggle();
    setupSaveButton();
    setupInitialValue();
    setupFillEmptySquaresInput();
    setupDrawModeInput();
    setupForm();
    setupClearButton();
    setupShareButtons();
    setupInputChangeHandlers();
    setupMatricesButtons();
    setupInitialMatrix();
};

document.addEventListener('DOMContentLoaded', () => {
    // check that all required elements are present in the DOM
    checkRequiredElements();
    // initialize the event listeners and controls
    initialize();
    // generate the initial grid
    updateGrid();
    centerGridWrapper();
});

const updateGrid = (props?: { input: number[][] }) => {
    const currentMatrix = currentMatrixState.getMatrix();
    const options = { ...getGeneratorOptions() };

    if (props) {
        // foreced input from props
        options.input = props.input;
    } else if (currentMatrix) {
        // use current matrix if available
        options.input = currentMatrix;
    } else {
        // otherwise the input from getGeneratorOptions is used, i.e. the message-input value
    }
    // update the current matrix state with the input value
    currentMatrixState.setMatrix(options.input);

    // draw the grid with the current options
    generateContributionGrid(options);

    // update the URL with the current matrix value
    setValueInURL('matrix', encodeMatrix(currentMatrixState.getMatrix() || []));

    // Clear the value from URL as we use matrix as input from here on
    setValueInURL('value', null);
};

const checkRequiredElements = () => {
    const requiredElements = [
        'grid-container',
        'contribution-grid',
        'message-input',
        'credits-input',
        'credits',
        'form',
        'save-button',
    ];
    for (const elementId of requiredElements) {
        if (!document.getElementById(elementId)) {
            throw new Error(
                `Required element with id "${elementId}" not found. Please ensure all required elements are present in your HTML.`
            );
        }
    }
};
