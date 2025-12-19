let isDrawing = false;
let isErasing = false; // Flag to track if erasing is active

const startDrawing = (event?: MouseEvent | null) => {
    isDrawing = true;
    isErasing = event?.button === 2; // Right-click for erasing
};

const stopDrawing = () => {
    isDrawing = false;
    isErasing = false; // Reset erasing flag
};

type PaintSquareEvent = MouseEvent | TouchEvent | { target: EventTarget | null; type: string };

const paintSquare = (event: PaintSquareEvent) => {
    if (!isDrawing && event.type != 'click') return;
    const square = event.target as HTMLElement;
    if (square?.classList.contains('square')) {
        const levelTemplate = 'level-{level}';
        square.className = `square ${levelTemplate.replace('{level}', isErasing ? '0' : (Math.random() > 0.5 ? 4 : 3).toString())}`; // Set the class name based on the action
        square.setAttribute('data-value', isErasing ? '0' : '1'); // Set the value attribute to 1 or 0 based on the action

        // Dispatch a custom event with the square and event details
        const customEvent = new CustomEvent('painted', {
            detail: { square, originalEvent: event },
            bubbles: true,
            cancelable: true,
        });
        square.dispatchEvent(customEvent);
    }
};

// Define reusable event handlers for touch events
const handleTouchStart = (event: TouchEvent) => {
    startDrawing();
    paintSquare(event);
};

const handleTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
    if (element) {
        paintSquare({ target: element, type: 'touchmove' });
    }
};

const contextMenuHandler = (event: MouseEvent) => {
    event.preventDefault(); // Prevent the context menu from appearing on right-click
};

export const activateDrawMode = (grid: HTMLElement) => {
    grid.style.touchAction = 'none'; // Disable default touch actions to prevent scrolling
    grid.style.userSelect = 'none'; // Disable text selection
    document.addEventListener('mousedown', startDrawing);
    document.addEventListener('mouseup', stopDrawing);
    document.addEventListener('mouseleave', stopDrawing);
    document.addEventListener('mousemove', paintSquare);
    document.addEventListener('contextmenu', contextMenuHandler); // Prevent context menu on right-click
    grid.addEventListener('click', paintSquare);

    grid.addEventListener('touchstart', handleTouchStart);
    grid.addEventListener('touchend', stopDrawing);
    grid.addEventListener('touchmove', handleTouchMove);
};

export const deactivateDrawMode = (grid: HTMLElement) => {
    grid.style.touchAction = 'auto'; // Re-enable default touch actions
    grid.style.userSelect = 'auto'; // Re-enable text selection
    document.removeEventListener('mousedown', startDrawing);
    document.removeEventListener('mouseup', stopDrawing);
    document.removeEventListener('mouseleave', stopDrawing);
    document.removeEventListener('mousemove', paintSquare);
    document.removeEventListener('contextmenu', contextMenuHandler); // Prevent context menu on right-click
    grid.removeEventListener('click', paintSquare);

    grid.removeEventListener('touchstart', handleTouchStart);
    grid.removeEventListener('touchend', stopDrawing);
    grid.removeEventListener('touchmove', handleTouchMove);
};
