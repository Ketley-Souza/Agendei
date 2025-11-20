import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';
import consts from '../../consts';

// --- Estado inicial ---
const INITIAL_STATE = {
    behavior: 'create', // create, update, read
    components: {
        confirmDelete: false,
        drawer: false,
        tab: 'dados-cadastrais',
    },
    form: {
        filtering: false,
        disabled: true,
        saving: false,
    },
    colaborador: {
        email: '',
        nome: '',
        telefone: '',
        dataNascimento: '',
        sexo: 'Masculino',
        foto: '',
        senha: '',
        especialidades: [],
    },
    colaboradores: [],
    servicos: [],
};

// --- Thunks assíncronos ---
export const allColaboradores = createAsyncThunk(
    'colaborador/allColaboradores',
    async (_, { getState, dispatch }) => {
        const { form } = getState().colaborador;
        dispatch(updateColaborador({ form: { ...form, filtering: true } }));

        try {
            const res = await api.get(`/colaborador/salao/${consts.salaoId}`);
            dispatch(updateColaborador({ form: { ...form, filtering: false } }));

            if (res.data.error) {
                toast.error(res.data.message);
                return;
            }

            dispatch(updateColaborador({ colaboradores: res.data.colaboradores }));
        } catch (err) {
            dispatch(updateColaborador({ form: { ...form, filtering: false } }));
            toast.error(err.message);
        }
    }
);

export const allServicos = createAsyncThunk(
    'colaborador/allServicos',
    async (_, { getState, dispatch }) => {
        try {
            const res = await api.get(`/salao/servicos/${consts.salaoId}`);
            
            if (res.data.error) {
                toast.error(res.data.message);
                return;
            }

            dispatch(updateColaborador({ servicos: res.data.servicos }));
        } catch (err) {
            toast.error(err.message);
        }
    }
);

export const addColaborador = createAsyncThunk(
    'colaborador/addColaborador',
    async (fotoFile, { getState, dispatch }) => {
        const { colaborador, form, components } = getState().colaborador;
        dispatch(updateColaborador({ form: { ...form, saving: true } }));

        try {
            const formData = new FormData();
            if (fotoFile) {
                formData.append('foto', fotoFile);
            }
            formData.append('colaborador', JSON.stringify(colaborador));
            formData.append('salaoId', consts.salaoId);

            const res = await api.post('/colaborador', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            dispatch(updateColaborador({ form: { ...form, saving: false } }));

            if (res.data.error) {
                toast.error(res.data.message);
                return;
            }

            dispatch(allColaboradores());
            dispatch(updateColaborador({ components: { ...components, drawer: false } }));
            dispatch(resetColaborador());
            toast.success('Colaborador salvo com sucesso!');
        } catch (err) {
            dispatch(updateColaborador({ form: { ...form, saving: false } }));
            toast.error(err.message);
        }
    }
);

export const saveColaborador = createAsyncThunk(
    'colaborador/saveColaborador',
    async (fotoFile, { getState, dispatch }) => {
        const { colaborador, form, components } = getState().colaborador;
        dispatch(updateColaborador({ form: { ...form, saving: true } }));

        try {
            const formData = new FormData();
            if (fotoFile) {
                formData.append('foto', fotoFile);
            }
            formData.append('colaborador', JSON.stringify(colaborador));

            const res = await api.put(`/colaborador/${colaborador._id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            dispatch(updateColaborador({ form: { ...form, saving: false } }));

            if (res.data.error) {
                toast.error(res.data.message);
                return;
            }

            dispatch(allColaboradores());
            dispatch(updateColaborador({ components: { ...components, drawer: false } }));
            dispatch(resetColaborador());
            toast.success('Colaborador salvo com sucesso!');
        } catch (err) {
            dispatch(updateColaborador({ form: { ...form, saving: false } }));
            toast.error(err.message);
        }
    }
);

export const unlinkColaborador = createAsyncThunk(
    'colaborador/unlinkColaborador',
    async (_, { getState, dispatch }) => {
        const { form, components, colaborador } = getState().colaborador;
        dispatch(updateColaborador({ form: { ...form, saving: true } }));

        try {
            const res = await api.delete(`/colaborador/vinculo/${colaborador.vinculoId}`);
            dispatch(updateColaborador({ form: { ...form, saving: false } }));

            if (res.data.error) {
                toast.error(res.data.message);
                return;
            }

            toast.success('Colaborador desvinculado com sucesso!');
            dispatch(allColaboradores());
            dispatch(
                updateColaborador({
                    components: { ...components, drawer: false, confirmDelete: false },
                })
            );
        } catch (err) {
            dispatch(updateColaborador({ form: { ...form, saving: false } }));
            toast.error(err.message);
        }
    }
);

// --- Slice ---
const colaboradorSlice = createSlice({
    name: 'colaborador',
    initialState: INITIAL_STATE,
    reducers: {
        updateColaborador: (state, action) => {
            Object.assign(state, action.payload);
        },
        resetColaborador: (state) => {
            state.colaborador = { ...INITIAL_STATE.colaborador };
        },
    },
});

export const { updateColaborador, resetColaborador } = colaboradorSlice.actions;
export default colaboradorSlice.reducer;
