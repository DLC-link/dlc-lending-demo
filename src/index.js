import { ChakraProvider } from '@chakra-ui/react';
import '@fontsource/poppins';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import persistStore from 'redux-persist/es/persistStore';
import App from './App';
import Observer from './services/Observer';
import store from './store/store';
import { appTheme } from './styles/appTheme';

const container = document.getElementById('root');
const root = createRoot(container);
let persistor = persistStore(store);

root.render(
  <Provider store={store}>
    <Observer />
    <ChakraProvider
      resetCSS
      theme={appTheme}>
      <App />
    </ChakraProvider>
  </Provider>
);
