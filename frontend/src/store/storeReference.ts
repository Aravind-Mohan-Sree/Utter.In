import { EnhancedStore } from '@reduxjs/toolkit';

let store: EnhancedStore | null = null;

export const setStore = (s: EnhancedStore) => {
    store = s;
};

export const getStore = () => {
    return store;
};
