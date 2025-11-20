import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

//Carregar estado inicial
const getInitialState = () => {
    const usuarioSalvo = localStorage.getItem('usuario');
    if (usuarioSalvo) {
        try {
            const usuario = JSON.parse(usuarioSalvo);
            //validando
            if (usuario && usuario.id && usuario.tipo) {
                return {
                    usuario,
                    isLogado: true,
                    tipo: usuario.tipo || null,
                    loading: false,
                    error: null,
                };
            } else {
                //Cleanando cammpos
                localStorage.removeItem('usuario');
            }
        } catch (err) {
            //Em caso de erro ao parsear, limpa
            console.error('Erro ao parsear usuário do localStorage:', err);
            localStorage.removeItem('usuario');
        }
    }
    return {
        usuario: null,
        isLogado: false,
        tipo: null,
        loading: false,
        error: null,
    };
};
const INITIAL_STATE = getInitialState();

//Thunks assíncronos
//Cadastro cliente
export const cadastrarCliente = createAsyncThunk(
    'auth/cadastrarCliente',
    async (dadosCliente, { rejectWithValue }) => {
        try {
            const { foto, ...dados } = dadosCliente;
            
            // Se tem foto (File), fazer upload primeiro
            let fotoUrl = '';
            if (foto && foto instanceof File) {
                const formData = new FormData();
                formData.append('foto', foto);
                
                const uploadRes = await api.post('/cliente/upload-foto', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                if (!uploadRes.data.error) {
                    fotoUrl = uploadRes.data.fotoUrl;
                }
            }
            
            // Cadastrar cliente com URL da foto
            const res = await api.post('/auth/cadastro', {
                ...dados,
                foto: fotoUrl
            });
            
            if (res.data.error) {
                toast.error(res.data.message);
                return rejectWithValue(res.data.message);
            }
            const usuario = res.data.usuario;
            //Salvando local
            localStorage.setItem('usuario', JSON.stringify(usuario));
            toast.success('Cadastro realizado com sucesso!');
            return usuario;
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Erro ao cadastrar cliente';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);
//Login geral
export const fazerLogin = createAsyncThunk(
    'auth/fazerLogin',
    async ({ email, senha }, { rejectWithValue }) => {
        try {
            const res = await api.post('/auth/login', { email, senha });
            if (res.data.error) {
                toast.error(res.data.message);
                return rejectWithValue(res.data.message);
            }

            const usuario = res.data.usuario;
            
            // Salva no localStorage
            localStorage.setItem('usuario', JSON.stringify(usuario));
            toast.success('Login realizado com sucesso!');
            return usuario;
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Erro ao fazer login';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);
//Validar usua´rio vendo no armazenammento local
export const verificarUsuario = createAsyncThunk(
    'auth/verificarUsuario',
    async (_, { rejectWithValue }) => {
        try {
            const usuarioSalvo = localStorage.getItem('usuario');
            if (!usuarioSalvo) {
                return rejectWithValue('Nenhum usuário logado');
            }
            const usuario = JSON.parse(usuarioSalvo);
            return usuario;
        } catch (err) {
            localStorage.removeItem('usuario');
            return rejectWithValue('Erro ao verificar usuário');
        }
    }
);
//=====Slice=====//
const authSlice = createSlice({
    name: 'auth',
    initialState: INITIAL_STATE,
    reducers: {
        logout: (state) => {
            localStorage.removeItem('usuario');
            state.usuario = null;
            state.isLogado = false;
            state.tipo = null;
            state.error = null;
            toast.success('Desconectado com sucesso!');
        },
        setUsuario: (state, action) => {
            state.usuario = action.payload;
            state.isLogado = !!action.payload;
            state.tipo = action.payload?.tipo || null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
      //Cadastro do cliente
        builder
            .addCase(cadastrarCliente.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cadastrarCliente.fulfilled, (state, action) => {
                state.loading = false;
                state.usuario = action.payload;
                state.isLogado = true;
                state.tipo = action.payload.tipo;
                state.error = null;
            })
            .addCase(cadastrarCliente.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
        //Login
        builder
            .addCase(fazerLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fazerLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.usuario = action.payload;
                state.isLogado = true;
                state.tipo = action.payload.tipo;
                state.error = null;
            })
            .addCase(fazerLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
        //Validar usuário
        builder
            .addCase(verificarUsuario.pending, (state) => {
                state.loading = true;
            })
            .addCase(verificarUsuario.fulfilled, (state, action) => {
                state.loading = false;
                state.usuario = action.payload;
                state.isLogado = true;
                state.tipo = action.payload.tipo;
            })
            .addCase(verificarUsuario.rejected, (state) => {
                state.loading = false;
                state.usuario = null;
                state.isLogado = false;
                state.tipo = null;
            });
    },
});

export const { logout, setUsuario, clearError } = authSlice.actions;
export default authSlice.reducer;

