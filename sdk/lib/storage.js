"use strict";
/**
* This is an auto generated code. This code should not be modified since the file can be overwritten
* if new genezio commands are executed.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageManager = void 0;
var LocalStorageWrapper = /** @class */ (function () {
    function LocalStorageWrapper() {
    }
    LocalStorageWrapper.prototype.setItem = function (key, value) {
        localStorage.setItem(key, value);
    };
    LocalStorageWrapper.prototype.getItem = function (key) {
        return localStorage.getItem(key);
    };
    LocalStorageWrapper.prototype.removeItem = function (key) {
        localStorage.removeItem(key);
    };
    LocalStorageWrapper.prototype.clear = function () {
        localStorage.clear();
    };
    return LocalStorageWrapper;
}());
var StorageManager = /** @class */ (function () {
    function StorageManager() {
    }
    StorageManager.getStorage = function () {
        if (!this.storage) {
            this.storage = new LocalStorageWrapper();
        }
        return this.storage;
    };
    StorageManager.setStorage = function (storage) {
        this.storage = storage;
    };
    StorageManager.storage = null;
    return StorageManager;
}());
exports.StorageManager = StorageManager;
