import { format } from "date-fns";

/*
    - Funções de datas e agenda
    - Funções gerais (validação, duração, baseURL etc.)
*/

const util = {
    // -----------------------------
    // CONFIGURAÇÕES
    // -----------------------------

    diasSemana: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],

    baseURL:
        process.env.NODE_ENV === "production"
            ? "https://agendei.vercel.app"
            : "http://localhost:8000",

    // -----------------------------
    // CORES
    // -----------------------------

    // Adiciona transparência a uma cor HEX
    toAlpha: (hex, alpha) => {
        const alphas = {
            100: "FF", 95: "F2", 90: "E6", 85: "D9", 80: "CC",
            75: "BF", 70: "B3", 65: "A6", 60: "99", 55: "8C",
            50: "80", 45: "73", 40: "66", 35: "59", 30: "4D",
            25: "40", 20: "33", 15: "26", 10: "1A", 5: "0D",
        };
        return hex + alphas[alpha];
    },

    // -----------------------------
    // AGENDA / HORÁRIOS
    // -----------------------------

    /**
    * Seleciona horários disponíveis
    * @param {Array} agenda - Array de objetos de agenda do backend
    * @param {String|null} data - 'yyyy-MM-dd'
    * @param {String|null} colaboradorId
    * @returns {Object} { horariosDisponiveis, data, colaboradorId, colaboradoresDia }
    */
    selectAgendamento: (agenda, data = null, colaboradorId = null) => {
        let horariosDisponiveis = [];
        let colaboradoresDia = [];

        if (!Array.isArray(agenda) || agenda.length === 0) {
            return { horariosDisponiveis, data, colaboradorId, colaboradoresDia };
        }

        // Pega o primeiro dia se nenhum foi selecionado
        data = data || Object.keys(agenda[0])[0];
        const diaObj = agenda.find(a => Object.keys(a)[0] === data)?.[data] || null;

        if (diaObj) {
            colaboradorId = colaboradorId || Object.keys(diaObj)[0];
            colaboradoresDia = diaObj;
            horariosDisponiveis = diaObj[colaboradorId] || [];
        }

        return { horariosDisponiveis, data, colaboradorId, colaboradoresDia };
    },

    // -----------------------------
    // VALIDAÇÕES
    // -----------------------------

    validateEmail: (email) => {
        const re =
            /^(([^<>()[\]\\.,;:@"]+(\.[^<>()[\]\\.,;:@"]+)*)|(".+"))@((\[[0-9]{1,3}(\.[0-9]{1,3}){3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    },

    // verifica campos obrigatórios
    allFields: (obj, keys) => {
        for (let key of keys) {
            const val = obj[key];
            if (val === undefined || val === null) return false;
            if (typeof val === "string" && val.trim() === "") return false;
            if (Array.isArray(val) && val.length === 0) return false;
            if (typeof val === "object" && !Array.isArray(val) && Object.keys(val).length === 0)
                return false;
        }
        return true;
    },

    // -----------------------------
    // DURAÇÃO (serviços)
    // -----------------------------

    // ex: 90 → "1h30min"
    formatarDuracao: (minutos) => {
        if (!minutos || minutos === 0) return "0min";

        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;

        if (horas > 0 && mins > 0) {
            return `${horas}h${mins.toString().padStart(2, "0")}min`;
        } else if (horas > 0) {
            return `${horas}h00min`;
        } else {
            return `${mins}min`;
        }
    },

    // converte "1h30min" → 90
    duracaoParaMinutos: (duracaoStr) => {
        if (!duracaoStr) return 0;
        if (typeof duracaoStr === "number") return duracaoStr;

        const match = duracaoStr.toLowerCase().match(/(?:(\d+)h)?\s*(?:(\d+)min)?/);

        if (!match) return 0;

        const horas = parseInt(match[1] || 0);
        const minutos = parseInt(match[2] || 0);

        return horas * 60 + minutos;
    },

    // soma duração do serviço principal + adicionais
    calcularDuracaoTotal: (servicoPrincipal, servicosAdicionais = []) => {
        let total = util.duracaoParaMinutos(servicoPrincipal?.duracao || 0);

        if (Array.isArray(servicosAdicionais)) {
            servicosAdicionais.forEach((s) => {
                total += util.duracaoParaMinutos(s?.duracao || 0);
            });
        }

        return total;
    },
    

     getLocalTimeFromISO: (isoString) => {
        if (!isoString) return null;
        // Remove timezone e pega apenas HH:mm
        const [datePart, timePart] = isoString.split('T');
        const [hour, minute] = timePart.substring(0, 5).split(':');
        return `${hour}:${minute}`;
    },

    // ------------------------------------------
    // CRIA ISO STRING COM HORA LOCAL (SEM CONVERSÃO DE FUSO)
    // ------------------------------------------
    toLocalISO: (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    },
    // -----------------------------
    // SESSÃO / USUÁRIO
    // -----------------------------
    getUsuarioFromLocalStorage: () => {
        try {
            const raw = localStorage.getItem('usuario');
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (err) {
            localStorage.removeItem('usuario');
            return null;
        }
    },

    getClienteIdFromLocalStorage: () => {
        const usuario = util.getUsuarioFromLocalStorage();
        return usuario?.id || usuario?._id || null;
    },
};

export default util;
