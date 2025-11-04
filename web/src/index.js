import React from 'react';
import ReactDOM from 'react-dom/client';
//import SiteRoutes from './admin.routes';
import ClienteRoutes from './routes/cliente.routes';
import AdminRoutes from './routes/admin.routes';
import { Provider } from 'react-redux';
import store from './store';
import { Toaster } from 'react-hot-toast'; // <-- importa o Toaster

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Provider store={store}>
    <>
      {/*<AdminRoutes />*/}
      <ClienteRoutes />
      <Toaster position="top-right" /> {/* <-- adiciona aqui */}
    </>
  </Provider>
);
