const mongoose = require('mongoose');
const URI = '';

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useCreatIndex', true);
mongoose.set('useFindAndModify', false);

mongoose.connect(URI)
.then(() => console.log('DB conectado.'))
.catch(() => console.log(err));
