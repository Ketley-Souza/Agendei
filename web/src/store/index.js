// O modules é uma junsão de todos os reducers da aplicação
import { configureStore } from '@reduxjs/toolkit';
import clienteReducer from './slices/clienteSlice';
import colaboradorReducer from './slices/colaboradorSlice';
import agendamentoReducer from './slices/agendamentoSlice';
import horarioReducer from './slices/horarioSlice';
import servicoReducer from './slices/servicoSlice';

const store = configureStore({
    reducer: {
        cliente: clienteReducer,
        colaborador: colaboradorReducer,
        agendamento: agendamentoReducer,
        horario: horarioReducer,
        servico: servicoReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
});

export default store;
