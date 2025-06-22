export const GetLocalStorage = <T>(key: string) => {
    const value = window.localStorage.getItem(key);
    if (value === null) return null;
    try {
        return JSON.parse(value) as T;
    } catch {
        return value as unknown as T;
    }
};
