import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { appTheme } from './styles/appTheme';
import store from './store/store';
import { Provider } from 'react-redux';

import '@fontsource/poppins';
import App from './App';
import startObserver from './observer';

startObserver();

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <ChakraProvider
      resetCSS
      theme={appTheme}>
      <App />
    </ChakraProvider>
  </Provider>
);
