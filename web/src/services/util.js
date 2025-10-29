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
            const val = obj[key];

            // Considerar ausente quando undefined ou null
            if (val === undefined || val === null) return false;

            // Strings vazias (ou só com espaços) são inválidas
            if (typeof val === 'string' && val.trim() === '') return false;

            // Arrays vazios são inválidos
            if (Array.isArray(val) && val.length === 0) return false;

            // Objetos vazios (sem chaves próprias) são inválidos
            if (
                typeof val === 'object' &&
                !Array.isArray(val) &&
                Object.keys(val).length === 0
            )
                return false;

            // Valores como 0, false são considerados válidos
        }
        return true;
    },
};

export default util;