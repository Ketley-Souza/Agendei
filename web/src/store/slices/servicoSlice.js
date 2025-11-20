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
    },
    form: {
        filtering: false,
        saving: false,
    },
    servico: {
        nomeServico: '',
        preco: '',
        duracao: '',
        descricao: '',
        imagem: null,
        imagemFile: null,
    },
    servicos: [],
};

// --- Thunks assíncronos ---
export const allServicos = createAsyncThunk(
    'servico/allServicos',
    async (_, { getState, dispatch }) => {
        const { form } = getState().servico;
        dispatch(updateServico({ form: { ...form, filtering: true } }));

        try {
            const res = await api.get(`/servico/salao/${consts.salaoId}`);
            dispatch(updateServico({ form: { ...form, filtering: false } }));

            if (res.data.error) {
                toast.error(res.data.message);
                return;
            }

            dispatch(updateServico({ servicos: res.data.servicos }));
        } catch (err) {
            dispatch(updateServico({ form: { ...form, filtering: false } }));
            toast.error(err.message);
        }
    }
);

export const addServico = createAsyncThunk(
    'servico/addServico',
    async (imagemFile, { getState, dispatch }) => {
        const { servico, form, components } = getState().servico;
        dispatch(updateServico({ form: { ...form, saving: true } }));

        try {
            const formData = new FormData();
            formData.append('salaoId', consts.salaoId);
            //Padronização
            const precoNum = parseFloat(servico.preco.toString().replace(',', '.'));
            
            formData.append('servico', JSON.stringify({
                nomeServico: servico.nomeServico,
                preco: precoNum,
                duracao: servico.duracao,
                descricao: servico.descricao,
                status: 'Disponivel',
            }));
            
            if (imagemFile) {
                formData.append('imagem', imagemFile);
            }

            const res = await api.post('/servico', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            dispatch(updateServico({ form: { ...form, saving: false } }));

            if (res.data.error) {
                toast.error(res.data.message);
                return;
            }

            dispatch(allServicos());
            dispatch(updateServico({ components: { ...components, drawer: false } }));
            dispatch(resetServico());
            toast.success('Serviço salvo com sucesso!');
        } catch (err) {
            dispatch(updateServico({ form: { ...form, saving: false } }));
            toast.error(err.message);
        }
    }
);

export const saveServico = createAsyncThunk(
    'servico/saveServico',
    async (imagemFile, { getState, dispatch }) => {
        const { servico, form, components } = getState().servico;
        dispatch(updateServico({ form: { ...form, saving: true } }));

        try {
            let res;

            //Padronizando preço
            const precoNum = parseFloat(servico.preco.toString().replace(',', '.'));

            if (imagemFile) {
                //Imagem em formdata
                const formData = new FormData();
                formData.append('servico', JSON.stringify({
                    nomeServico: servico.nomeServico,
                    preco: precoNum,
                    duracao: servico.duracao,
                    descricao: servico.descricao,
                    status: servico.status || 'Disponivel',
                }));
                formData.append('imagem', imagemFile);

                res = await api.put(`/servico/${servico._id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                //Json
                res = await api.put(`/servico/${servico._id}`, {
                    nomeServico: servico.nomeServico,
                    preco: precoNum,
                    duracao: servico.duracao,
                    descricao: servico.descricao,
                    status: servico.status || 'Disponivel',
                });
            }

            dispatch(updateServico({ form: { ...form, saving: false } }));

            if (res.data.error) {
                toast.error(res.data.message);
                return;
            }

            dispatch(allServicos());
            dispatch(updateServico({ components: { ...components, drawer: false } }));
            dispatch(resetServico());
            toast.success('Serviço atualizado com sucesso!');
        } catch (err) {
            dispatch(updateServico({ form: { ...form, saving: false } }));
            toast.error(err.message);
        }
    }
);

export const deleteServico = createAsyncThunk(
    'servico/deleteServico',
    async (_, { getState, dispatch }) => {
        const { servico, form, components } = getState().servico;
        dispatch(updateServico({ form: { ...form, saving: true } }));

        try {
            const res = await api.delete(`/servico/${servico._id}`);
            dispatch(updateServico({ form: { ...form, saving: false } }));

            if (res.data.error) {
                toast.error(res.data.message);
                return;
            }

            dispatch(allServicos());
            dispatch(updateServico({ components: { ...components, drawer: false, confirmDelete: false } }));
            dispatch(resetServico());
            toast.success('Serviço excluído com sucesso!');
        } catch (err) {
            dispatch(updateServico({ form: { ...form, saving: false } }));
            toast.error(err.message);
        }
    }
);

// --- Slice ---
const servicoSlice = createSlice({
    name: 'servico',
    initialState: INITIAL_STATE,
    reducers: {
        updateServico: (state, action) => {
            Object.assign(state, action.payload);
        },
        resetServico: (state) => {
            state.servico = {
                nomeServico: '',
                preco: '',
                duracao: '',
                descricao: '',
                imagem: null,
                imagemFile: null,
            };
        },
    },
});

export const { updateServico, resetServico } = servicoSlice.actions;
export default servicoSlice.reducer;
