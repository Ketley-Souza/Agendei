const util = {
    baseURL:
        process.env.NODE_ENV === 'production'
            ? 'https://ws.salaonamao.com.br:8000'
            : 'http://localhost:8000',

    validateEmail: (email) => {
        const re =
            /^(([^<>()[\]\\.,;:@"]+(\.[^<>()[\]\\.,;:@"]+)*)|(".+"))@((\[[0-9]{1,3}(\.[0-9]{1,3}){3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return re.test(String(email).toLowerCase());
    },

    allFields: (obj, keys) => {
        for (let key of keys) {
            const val = obj[key]
            if (val === undefined || val === null) return false;
            if (typeof val === 'string' && val.trim() === '') return false;
            if (Array.isArray(val) && val.length === 0) return false;
            if (
                typeof val === 'object' &&
                !Array.isArray(val) &&
                Object.keys(val).length === 0
            )
                return false;
        }
        return true;
    },

    //Formatando duração
    formatarDuracao: (minutos) => {
        //Verifica sintaxe
        if (!minutos || minutos === 0) return '0min';

        //Convertendo para número se for string
        const mins = typeof minutos === 'string' ? parseInt(minutos) : minutos;

        if (isNaN(mins)) return minutos;

        const horas = Math.floor(mins / 60);
        const minutosRestantes = mins % 60;

        if (horas > 0 && minutosRestantes > 0) {
            return `${horas}h${minutosRestantes.toString().padStart(2, '0')}min`;
        } else if (horas > 0) {
            return `${horas}h00min`;
        } else {
            return `${minutosRestantes}min`;
        }
    },

    //Converte em minuto
    duracaoParaMinutos: (duracaoStr) => {
        if (!duracaoStr) return 0;
        if (typeof duracaoStr === 'number') return duracaoStr;

        const str = duracaoStr.toString().toLowerCase();
        const match = str.match(/(?:(\d+)h)?\s*(?:(\d+)min)?/);

        if (!match) return 0;

        const horas = parseInt(match[1] || 0);
        const minutos = parseInt(match[2] || 0);

        return horas * 60 + minutos;
    },

    //Calcula duração total dos serviços
    calcularDuracaoTotal: (servicoPrincipal, servicosAdicionais = []) => {
        let duracaoTotal = util.duracaoParaMinutos(servicoPrincipal?.duracao || 0);

        if (servicosAdicionais && Array.isArray(servicosAdicionais)) {
            servicosAdicionais.forEach(servico => {
                duracaoTotal += util.duracaoParaMinutos(servico?.duracao || 0);
            });
        }

        return duracaoTotal;
    },
};

export default util;