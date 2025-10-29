const { format, parse, parseISO, isAfter, isBefore, isWithinInterval, addMinutes, getDay } = require('date-fns');

module.exports = {
    SLOT_DURATION: 30, // MINUTOS

    isOpened: async (horarios) => {
        const today = new Date();
        const dayOfWeek = getDay(today); // 0 = Domingo, 1 = Segunda, etc.

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

    toCents: (price) => {
        return parseInt(price.toString().replace('.', '').replace(',', ''));
    },

    mergeDateTime: (date, time) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const timeStr = format(time, 'HH:mm');
        return `${dateStr}T${timeStr}`;
    },

    sliceMinutes: (start, end, duration, validation = true) => {
        let slices = [];
        const now = new Date();
        start = typeof start === 'string' ? parseISO(start) : start;
        end = typeof end === 'string' ? parseISO(end) : end;

        while (isBefore(start, end)) {
            if (validation && format(start, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) {
                if (isAfter(start, now)) {
                    slices.push(format(start, 'HH:mm'));
                }
            } else {
                slices.push(format(start, 'HH:mm'));
            }
            start = addMinutes(start, duration);
        }

        return slices;
    },

    hourToMinutes: (hourMinute) => {
        const [hour, minutes] = hourMinute.split(':').map(Number);
        return hour * 60 + minutes;
    },

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
};
