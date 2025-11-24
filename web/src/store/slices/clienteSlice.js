import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api'; // agora é Axios
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
    cliente: {
        email: '',
        nome: '',
        telefone: '',
        dataNascimento: '',
        sexo: 'Masculino',
    },
    clientes: [],
};

// --- Thunks assíncronos ---
export const filterCliente = createAsyncThunk(
    'cliente/filterCliente',
    async (filters, { getState, dispatch }) => {
        const { form } = getState().cliente;
        dispatch(updateCliente({ form: { ...form, filtering: true } }));

        try {
            const res = await api.post('/cliente/filter', filters);

            dispatch(updateCliente({ form: { ...form, filtering: false } }));

            if (res.data.error) {
                toast.error(res.data.message);
                return;
            }

            if (res.data.clientes.length > 0) {
                dispatch(
                    updateCliente({
                        cliente: res.data.clientes[0],
                        form: { ...form, filtering: false, disabled: true },
                    })
                );
            } else {
                dispatch(
                    updateCliente({ form: { ...form, filtering: false, disabled: false } })
                );
            }

            return res.data.clientes;
        } catch (err) {
            dispatch(updateCliente({ form: { ...form, filtering: false } }));
            toast.error(err.message);
        }
    }
);


export const addCliente = createAsyncThunk(
    'cliente/addCliente',
    async (_, { getState, dispatch }) => {
        const { cliente, form, components } = getState().cliente;
        dispatch(updateCliente({ form: { ...form, saving: true } }));

        try {
            const res = await api.post('/cliente', {
                cliente,
                salaoId: consts.salaoId,
            });

            dispatch(updateCliente({ form: { ...form, saving: false } }));

            if (res.data.error) {
                toast.error(res.data.message);
                return;
            }

            //  Aqui muda: recarrega todos os clientes direto do servidor
            dispatch(allClientes());
            dispatch(updateCliente({ components: { ...components, drawer: false } }));
            dispatch(resetCliente());

            toast.success('Cliente salvo com sucesso!');
        } catch (err) {
            dispatch(updateCliente({ form: { ...form, saving: false } }));
            toast.error(err.message);
        }
    }
);




export const allClientes = createAsyncThunk(
    'cliente/allClientes',
    async (_, { getState, dispatch }) => {
        const { form } = getState().cliente;
        dispatch(updateCliente({ form: { ...form, filtering: true } }));

        try {
            const res = await api.get(`/cliente/salao/${consts.salaoId}`);
            dispatch(updateCliente({ form: { ...form, filtering: false } }));

            if (res.data.error) {
                toast.error(res.data.message);
                return;
            }

            dispatch(updateCliente({ clientes: res.data.clientes }));
        } catch (err) {
            dispatch(updateCliente({ form: { ...form, filtering: false } }));
            toast.error(err.message);
        }
    }
);

export const unlinkCliente = createAsyncThunk(
    'cliente/unlinkCliente',
    async (_, { getState, dispatch }) => {
        const { form, components, cliente } = getState().cliente;
        dispatch(updateCliente({ form: { ...form, saving: true } }));

        try {
            const res = await api.delete(`/cliente/vinculo/${cliente.vinculoId}`);
            dispatch(updateCliente({ form: { ...form, saving: false } }));

            if (res.data.error) {
                toast.error(res.data.message);
                return;
            }

            toast.success('O cliente foi desvinculado com sucesso!');
            dispatch(allClientes());
            dispatch(
                updateCliente({
                    components: { ...components, drawer: false, confirmDelete: false },
                })
            );
        } catch (err) {
            dispatch(updateCliente({ form: { ...form, saving: false } }));
            toast.error(err.message);
        }
    }
);

export const atualizarPerfilCliente = createAsyncThunk(
    'cliente/atualizarPerfilCliente',
    async (dadosAtualizacao, { rejectWithValue }) => {
        try {
            const { clienteId, foto, ...dados } = dadosAtualizacao;

            let fotoUrl = foto;
            if (foto && foto instanceof File) {
                const formData = new FormData();
                formData.append('foto', foto);

                const uploadRes = await api.post('/cliente/upload-foto', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (uploadRes.data.error) {
                    return rejectWithValue(uploadRes.data.message);
                }

                fotoUrl = uploadRes.data.fotoUrl;
            }

            const res = await api.put(`/cliente/${clienteId}`, {
                ...dados,
                foto: fotoUrl
            });

            if (res.data.error) {
                return rejectWithValue(res.data.message);
            }

            return res.data.cliente;
        } catch (err) {
            const message = err.response?.data?.message || err.message;
            return rejectWithValue(message);
        }
    }
);

// --- Slice ---
const clienteSlice = createSlice({
    name: 'cliente',
    initialState: INITIAL_STATE,
    reducers: {
        updateCliente: (state, action) => {
            //  Forma segura e compatível com Redux Toolkit
            Object.assign(state, action.payload);
        },
        resetCliente: (state) => {
            //  Mantém a estrutura e limpa só o cliente
            state.cliente = { ...INITIAL_STATE.cliente };
        },
    },
});


export const { updateCliente, resetCliente } = clienteSlice.actions;
export default clienteSlice.reducer;
