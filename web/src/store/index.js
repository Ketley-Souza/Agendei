import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import clienteReducer from './slices/clienteSlice';
import colaboradorReducer from './slices/colaboradorSlice';
import agendamentoReducer from './slices/agendamentoSlice';
import horarioReducer from './slices/horarioSlice';
import servicoReducer from './slices/servicoSlice';
import salaoReducer from './slices/salaoSlice'; // <-- adicione aqui

const store = configureStore({
    reducer: {
        auth: authReducer,
        cliente: clienteReducer,
        colaborador: colaboradorReducer,
        agendamento: agendamentoReducer,
        horario: horarioReducer,
        servico: servicoReducer,
        salao: salaoReducer, // <-- adicione aqui
    },
    devTools: process.env.NODE_ENV !== 'production',
});

export default store;
