import { createSlice } from '@reduxjs/toolkit';

const clienteSlice = createSlice({
    name: 'cliente',
    initialState: [],
    reducers: {
        setClientes: (state, action) => action.payload,
    },
});

export const { setClientes } = clienteSlice.actions;
export default clienteSlice.reducer;