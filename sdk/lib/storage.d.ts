/**
* This is an auto generated code. This code should not be modified since the file can be overwritten
* if new genezio commands are executed.
*/
export interface Storage {
    setItem(key: string, value: string): void;
    getItem(key: string): string | null;
    removeItem(key: string): void;
    clear(): void;
}
export declare class StorageManager {
    private static storage;
    static getStorage(): Storage;
    static setStorage(storage: Storage): void;
}
