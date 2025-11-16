import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import consts from '../../consts';
import util from "../../services/util";

// 🔹 ESTADO INICIAL
const INITIAL_STATE = {
  behavior: 'create',
  components: { confirmDelete: false, drawer: false, view: 'week' },
  form: { filtering: false, disabled: true, saving: false },
  horario: { dias: [], inicio: '', fim: '', especialidades: [], colaboradores: [] },
  horarios: [],
  servicos: [],
  colaboradores: [],
};

// THUNKS ASSÍNCRONOS
export const addHorario = createAsyncThunk(
  'horario/addHorario',
  async (payload, { getState, dispatch, rejectWithValue }) => {
    try {
      const horarioFromState = (getState().horario && getState().horario.horario) || {};
      const horarioToSendRaw = payload && Object.keys(payload).length > 0 ? payload : horarioFromState;

      const toISODateFromHHmm = (hhmm) => {
        if (!hhmm || typeof hhmm !== 'string') return hhmm;
        const m = hhmm.trim().match(/^(\d{1,2}):(\d{2})$/);
        if (!m) return hhmm;
        const hh = Number(m[1]), mm = Number(m[2]);
        const d = new Date();
        d.setHours(hh, mm, 0, 0);
        return util.toLocalISO(d);
      };

      console.log('[DEBUG] addHorario chamado: beforeNormalize =', horarioToSendRaw);

      const normalized = { ...horarioToSendRaw };
      if (typeof normalized.inicio === 'string' && /^\s*\d{1,2}:\d{2}\s*$/.test(normalized.inicio)) {
        normalized.inicio = toISODateFromHHmm(normalized.inicio);
      }
      if (typeof normalized.fim === 'string' && /^\s*\d{1,2}:\d{2}\s*$/.test(normalized.fim)) {
        normalized.fim = toISODateFromHHmm(normalized.fim);
      }

      console.log('[DEBUG] addHorario: horarioToSend (normalized) =', normalized);

      const { form, components } = getState().horario;
      dispatch(updateHorario({ form: { ...form, saving: true } }));

      const { data: res } = await api.post('/horario', {
        ...normalized,
        salaoId: consts.salaoId,
      });

      dispatch(updateHorario({ form: { ...form, saving: false } }));

      if (res && res.error) {
        console.warn('[DEBUG] addHorario - resposta do backend com erro ->', res);
        toast.error(res.message || 'Erro ao salvar horário');
        return rejectWithValue(res.message);
      }

      dispatch(allHorarios());
      dispatch(updateHorario({ components: { ...components, drawer: false } }));
      dispatch(resetHorario());
      toast.success('Horário salvo com sucesso!');
      return res;
    } catch (err) {
      console.error('[DEBUG] Erro no addHorario:', err);
      const errMsg = err?.response?.data?.message || err.message || String(err);
      toast.error(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);
//allHorarios
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
//saveHorario
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

//removeHorario
export const removeHorario = createAsyncThunk(
  'horario/removeHorario',
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue('horarioId não informado');
      }
      const { form, components } = getState().horario;
      dispatch(updateHorario({ form: { ...form, saving: true } }));

      const { data: res } = await api.delete(`/horario/${id}`);
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
      return res;
    } catch (err) {
      dispatch(updateHorario({ form: { ...getState().horario.form, saving: false } }));
      console.error('[DEBUG] Erro removeHorario:', err);
      toast.error(err.message || String(err));
      return rejectWithValue(err.message || String(err));
    }
  }
);
//allHorarios/allServicos
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
//horario/filterColaboradores
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
// 🔹 SLICE
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

export const { updateHorario, resetHorario } = horarioSlice.actions;
export default horarioSlice.reducer;
