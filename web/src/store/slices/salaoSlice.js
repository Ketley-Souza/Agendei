// store/slices/salaoSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import consts from "../../consts";
import util from "../../services/util";

/* ===============================================
   THUNK: BUSCAR DISPONIBILIDADE
================================================ */
export const fetchDisponibilidade = createAsyncThunk(
    "salao/disponibilidade",
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState().salao;

            // Converter dataSelecionada de ISO string para Date antes de enviar
            const payload = {
                salaoId: consts.salaoId,
                data: new Date(state.dataSelecionada),
                servicos: state.servicosSelecionados.map(s => s._id),
                colaboradorId: state.colaboradorSelecionado
            };

            const { data } = await api.post("/agendamento/disponibilidade", payload);

            return {
                colaboradoresDisponiveis: data.colaboradoresDisponiveis || [],
                horariosDisponiveis: data.horariosDisponiveis || []
            };
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

/* ===============================================
   ESTADO INICIAL
================================================ */
const INITIAL_STATE = {
    servicosSelecionados: [],
    servicoPreSelecionado: null,

    // Armazena como string ISO para ser serializável
    dataSelecionada: util.toLocalISO(new Date()),
    colaboradoresDisponiveis: [],
    colaboradorSelecionado: null,
    horariosDisponiveis: [],
    horaSelecionada: null,

    form: {
        agendamentoLoading: false
    }
};

/* ===============================================
   SLICE
================================================ */
const salaoSlice = createSlice({
    name: "salao",
    initialState: INITIAL_STATE,
    reducers: {
        setServicosSelecionados: (state, { payload }) => {
            state.servicosSelecionados = payload;
        },

        setServicoPreSelecionado: (state, { payload }) => {
            state.servicoPreSelecionado = payload;
        },

        limparServicoSelecionado: (state) => {
            state.servicoPreSelecionado = null;
        },

        updateAgendamento: (state, { payload }) => {
            const { campo, valor } = payload;

            // Converte Date para string ISO ao atualizar dataSelecionada
            state[campo] = campo === "dataSelecionada" && valor instanceof Date
                ? util.toLocalISO(valor)
                : valor;
        },

        resetAgendamento: () => INITIAL_STATE
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchDisponibilidade.pending, (state) => {
                state.form.agendamentoLoading = true;
            })
            .addCase(fetchDisponibilidade.fulfilled, (state, { payload }) => {
                state.form.agendamentoLoading = false;
                state.colaboradoresDisponiveis = payload.colaboradoresDisponiveis;
                state.horariosDisponiveis = payload.horariosDisponiveis;

                // Se não tiver colaborador selecionado, escolhe o primeiro
                if (!state.colaboradorSelecionado && payload.colaboradoresDisponiveis.length > 0) {
                    state.colaboradorSelecionado = payload.colaboradoresDisponiveis[0]._id;
                }
            })
            .addCase(fetchDisponibilidade.rejected, (state, { payload }) => {
                state.form.agendamentoLoading = false;
                console.error("Erro ao buscar disponibilidade:", payload.message);
                state.colaboradoresDisponiveis = [];
                state.horariosDisponiveis = [];
            });
    }
});

export const {
    setServicosSelecionados,
    setServicoPreSelecionado,
    limparServicoSelecionado,
    updateAgendamento,
    resetAgendamento
} = salaoSlice.actions;

export default salaoSlice.reducer;
