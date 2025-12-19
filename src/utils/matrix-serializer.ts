import pako from 'pako';

export const encodeMatrix = (matrix: number[][]): string => {
    const compressedData = pako.gzip(JSON.stringify(matrix));
    return btoa(String.fromCharCode(...compressedData));
};

export const decodeMatrix = (encodedMatrix: string): number[][] => {
    try {
        const compressedUint8Array = new Uint8Array(
            atob(encodedMatrix)
                .split('')
                .map((c) => c.charCodeAt(0))
        );
        const decompressedJsonString = pako.ungzip(compressedUint8Array, { to: 'string' });
        return JSON.parse(decompressedJsonString);
    } catch {
        return [];
    }
};
