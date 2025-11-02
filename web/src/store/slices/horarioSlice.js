import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import consts from '../../consts';

// 🔹 ESTADO INICIAL
const INITIAL_STATE = {
    behavior: 'create', // create, update, read
    components: {
        confirmDelete: false,
        drawer: false,
        view: 'week',
    },
    form: {
        filtering: false,
        disabled: true,
        saving: false,
    },
    horario: {
        dias: [],
        inicio: '',
        fim: '',
        especialidades: [],
        colaboradores: [],
    },
    horarios: [],
    servicos: [],
    colaboradores: [],
};

// 🔹 THUNKS ASSÍNCRONOS
export const addHorario = createAsyncThunk(
    'horario/addHorario',
    async (_, { getState, dispatch, rejectWithValue }) => {
        try {
            const { horario, form, components } = getState().horario;
            dispatch(updateHorario({ form: { ...form, saving: true } }));

            const { data: res } = await api.post('/horario', {
                ...horario,
                salaoId: consts.salaoId,
            });

            dispatch(updateHorario({ form: { ...form, saving: false } }));

            if (res.error) {
                toast.error(res.message);
                return rejectWithValue(res.message);
            }

            dispatch(allHorarios());
            dispatch(updateHorario({ components: { ...components, drawer: false } }));
            dispatch(resetHorario());
            toast.success('Horário salvo com sucesso!');
        } catch (err) {
            toast.error(err.message);
            return rejectWithValue(err.message);
        }
    }
);

export const allHorarios = createAsyncThunk(
    'horario/allHorarios',
    async (_, { getState, dispatch, rejectWithValue }) => {
        try {
            const { form } = getState().horario;
            dispatch(updateHorario({ form: { ...form, filtering: true } }));

            const { data: res } = await api.get(`/horario/salao/${consts.salaoId}`);
            dispatch(updateHorario({ form: { ...form, filtering: false } }));

            if (res.error) {
                toast.error(res.message);
                return rejectWithValue(res.message);
            }

            dispatch(updateHorario({ horarios: res.horarios }));
        } catch (err) {
            dispatch(updateHorario({ form: { ...getState().horario.form, filtering: false } }));
            toast.error(err.message);
            return rejectWithValue(err.message);
        }
    }
);

export const saveHorario = createAsyncThunk(
    'horario/saveHorario',
    async (_, { getState, dispatch, rejectWithValue }) => {
        try {
            const { horario, form, components } = getState().horario;
            dispatch(updateHorario({ form: { ...form, saving: true } }));

            const { data: res } = await api.put(`/horario/${horario._id}`, horario);
            dispatch(updateHorario({ form: { ...form, saving: false } }));

            if (res.error) {
                toast.error(res.message);
                return rejectWithValue(res.message);
            }

            dispatch(allHorarios());
            dispatch(updateHorario({ components: { ...components, drawer: false } }));
            dispatch(resetHorario());
            toast.success('Serviço salvo com sucesso!');
        } catch (err) {
            dispatch(updateHorario({ form: { ...getState().horario.form, saving: false } }));
            toast.error(err.message);
            return rejectWithValue(err.message);
        }
    }
);

export const removeHorario = createAsyncThunk(
    'horario/removeHorario',
    async (_, { getState, dispatch, rejectWithValue }) => {
        try {
            const { horario, form, components } = getState().horario;
            dispatch(updateHorario({ form: { ...form, saving: true } }));

            const { data: res } = await api.delete(`/horario/${horario._id}`);
            dispatch(updateHorario({ form: { ...form, saving: false } }));

            if (res.error) {
                toast.error(res.message);
                return rejectWithValue(res.message);
            }

            dispatch(allHorarios());
            dispatch(
                updateHorario({
                    components: { ...components, drawer: false, confirmDelete: false },
                })
            );
            toast.success('Horário removido com sucesso!');
        } catch (err) {
            dispatch(updateHorario({ form: { ...getState().horario.form, saving: false } }));
            toast.error(err.message);
            return rejectWithValue(err.message);
        }
    }
);

export const allServicos = createAsyncThunk(
    'horario/allServicos',
    async (_, { getState, dispatch, rejectWithValue }) => {
        try {
            const { form } = getState().horario;
            dispatch(updateHorario({ form: { ...form, filtering: true } }));

            const { data: res } = await api.get(`/salao/servicos/${consts.salaoId}`);
            dispatch(updateHorario({ form: { ...form, filtering: false } }));

            if (res.error) {
                toast.error(res.message);
                return rejectWithValue(res.message);
            }

            dispatch(updateHorario({ servicos: res.servicos }));
        } catch (err) {
            dispatch(updateHorario({ form: { ...getState().horario.form, filtering: false } }));
            toast.error(err.message);
            return rejectWithValue(err.message);
        }
    }
);

export const filterColaboradores = createAsyncThunk(
    'horario/filterColaboradores',
    async (_, { getState, dispatch, rejectWithValue }) => {
        try {
            const { form, horario } = getState().horario;
            dispatch(updateHorario({ form: { ...form, filtering: true } }));

            const { data: res } = await api.post(`/horario/colaboradores`, {
                servicos: horario.especialidades,
            });
            dispatch(updateHorario({ form: { ...form, filtering: false } }));

            if (res.error) {
                toast.error(res.message);
                return rejectWithValue(res.message);
            }

            dispatch(updateHorario({ colaboradores: res.colaboradores }));
        } catch (err) {
            dispatch(updateHorario({ form: { ...getState().horario.form, filtering: false } }));
            toast.error(err.message);
            return rejectWithValue(err.message);
        }
    }
);

// 🔹 SLICE PRINCIPAL
const horarioSlice = createSlice({
    name: 'horario',
    initialState: INITIAL_STATE,
    reducers: {
        updateHorario: (state, action) => {
            return { ...state, ...action.payload };
        },
        resetHorario: (state) => {
            state.horario = INITIAL_STATE.horario;
        },
    },
});

// 🔹 EXPORTAÇÕES
export const { updateHorario, resetHorario } = horarioSlice.actions;
export default horarioSlice.reducer;
