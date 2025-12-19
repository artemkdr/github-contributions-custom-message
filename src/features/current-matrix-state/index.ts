const createCurrentMatrixState = () => {
    let currentMatrix: number[][] | undefined | null = null;

    const getMatrix = () => {
        return currentMatrix;
    };

    const setMatrix = (matrix: number[][] | undefined | null): void => {
        currentMatrix = matrix;
    };

    const updateMatrix = (rowIndex: number, colIndex: number, value: number) => {
        if (currentMatrix && currentMatrix[rowIndex] && currentMatrix[rowIndex][colIndex] !== undefined) {
            currentMatrix[rowIndex][colIndex] = value;
        }
    };

    const resetMatrix = () => {
        currentMatrix = null;
    };

    const serializeMatrix = (): string | null => {
        return currentMatrix ? JSON.stringify(currentMatrix) : null;
    };

    const deserializeMatrix = (serializedMatrix: string): void => {
        try {
            currentMatrix = JSON.parse(serializedMatrix);
        } catch {
            currentMatrix = null;
        }
    };

    return {
        getMatrix,
        setMatrix,
        updateMatrix,
        resetMatrix,
        serializeMatrix,
        deserializeMatrix,
    };
};

export const currentMatrixState = createCurrentMatrixState();
