import { createSlice } from "@reduxjs/toolkit";

const loadAuthFromLocalStorage = () => {
    try {
        const serializedState = localStorage.getItem('auth');
        if (serializedState == null) return { user: null, token: null, store: null };
        return JSON.parse(serializedState);
    } catch (error) {
        return { user: null, token: null, store: null };
    }
}

const save = (state) => {
    try {
        localStorage.setItem('auth', JSON.stringify({ user: state.user, token: state.token, store: state.store }));
    } catch (_) { /* storage unavailable */ }
}

const authSlice = createSlice({
    name: 'auth',
    initialState: loadAuthFromLocalStorage(),
    reducers: {
        // payload: { user, token?, store? }
        setUser: (state, action) => {
            state.user = action.payload.user;
            if (action.payload.token !== undefined) state.token = action.payload.token;
            if (action.payload.store !== undefined) state.store = action.payload.store;
            save(state);
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.store = null;
            try { localStorage.removeItem('auth') } catch (_) { /* ignore */ }
        }
    }
})

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
