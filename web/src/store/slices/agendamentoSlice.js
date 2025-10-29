import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import consts from '../../consts';


//  Thunk para buscar agendamentos (substitui saga)
export const filterAgendamentos = createAsyncThunk(
    'agendamento/filterAgendamentos',
    async (range, { rejectWithValue }) => {
        try {
            const { data: res } = await api.post('/agendamento/filter', {
                salaoId: consts.salaoId,
                range,
            });

            if (res.error) {
                return rejectWithValue(res.message);
            }

            return res.agendamentos;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

const agendamentoSlice = createSlice({
    name: 'agendamento',
    initialState: {
        components: {
            modal: false,
        },
        agendamento: {},
        agendamentos: [],
        status: 'idle', // idle | loading | succeeded | failed
        error: null,
    },
    reducers: {
        updateAgendamento: (state, action) => {
            Object.assign(state, action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(filterAgendamentos.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(filterAgendamentos.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.agendamentos = action.payload;
            })
            .addCase(filterAgendamentos.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { updateAgendamento } = agendamentoSlice.actions;
export default agendamentoSlice.reducer;
