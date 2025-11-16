const {
    format,
    parse,
    parseISO,
    isAfter,
    isBefore,
    isWithinInterval,
    addMinutes,
    getDay
} = require('date-fns');

module.exports = {
    SLOT_DURATION: 30, // minutos por slot

    // ------------------------------------------
    // VERIFICA SE O SALÃO ESTÁ ABERTO HOJE
    // ------------------------------------------
    isOpened: async (horarios) => {
        const today = new Date();
        const dayOfWeek = getDay(today); 

        const horariosDia = horarios.filter(h => h.dias.includes(dayOfWeek));
        if (horariosDia.length === 0) return false;

        for (let h of horariosDia) {
            const inicio = parse(h.inicio, 'HH:mm', today);
            const fim = parse(h.fim, 'HH:mm', today);

            if (isWithinInterval(today, { start: inicio, end: fim })) {
                return true;
            }
        }
        return false;
    },

    // ------------------------------------------
    // PREÇO EM CENTAVOS
    // ------------------------------------------
    toCents: (price) => {
        return parseInt(price.toString().replace('.', '').replace(',', ''));
    },

    // ------------------------------------------
    // UNE DATA DO DIA COM HORÁRIO — RETORNA DATE CORRETO
    // ------------------------------------------
    mergeDateTime: (date, time) => {
        // time: vem como objeto Date (janela.inicio/fim)
        const dateStr = format(date, 'yyyy-MM-dd');
        const timeStr = format(time, 'HH:mm');

        return parseISO(`${dateStr}T${timeStr}:00`);
    },

    // ------------------------------------------
    // GERA SLOTS ENTRE "start" e "end"
    // validation = false → não filtra horários passados
    // ------------------------------------------
    sliceMinutes: (start, end, duration, validation = true) => {
        let slices = [];

        start = typeof start === 'string' ? parseISO(start) : start;
        end = typeof end === 'string' ? parseISO(end) : end;

        const now = new Date();
        const isToday = format(start, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');

        while (isBefore(start, end)) {
            const horario = format(start, 'HH:mm');

            if (validation && isToday) {
                // não incluir horários passados HOJE
                if (isAfter(start, now)) {
                    slices.push(horario);
                }
            } else {
                slices.push(horario);
            }

            start = addMinutes(start, duration);
        }

        return slices;
    },

    // ------------------------------------------
    // CONVERTE "HH:mm" EM MINUTOS
    // ------------------------------------------
    hourToMinutes: (hourMinute) => {
        const [hour, minutes] = hourMinute.split(':').map(Number);
        return hour * 60 + minutes;
    },

    // ------------------------------------------
    // DIVIDE ARRAY POR UM VALOR
    // ------------------------------------------
    splitByValue: (array, value) => {
        let newArray = [[]];
        array.forEach(item => {
            if (item !== value) {
                newArray[newArray.length - 1].push(item);
            } else {
                newArray.push([]);
            }
        });
        return newArray;
    },

    // ------------------------------------------
    // EXTRAI HORA LOCAL DE DATA ISO SEM CONVERTER TIMEZONE
    // Problema: "2025-11-15T12:00:00Z" no banco aparece como 9:00 no front
    // Solução: Extrair apenas HH:mm em hora local
    // ------------------------------------------
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
};

