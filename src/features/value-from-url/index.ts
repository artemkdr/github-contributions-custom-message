export const getValueFromURL = (key: string): string => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key) || '';
};

export const setValueInURL = (key: string, value: string | null): void => {
    const urlParams = new URLSearchParams(window.location.search);
    if (value === null) {
        urlParams.delete(key);
    } else {
        urlParams.set(key, value);
    }
    window.history.replaceState(null, '', `?${urlParams.toString()}`);
};
