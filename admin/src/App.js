import React, { Component } from 'react';
import { Provider } from 'react-redux';

import configureStore from './store/configure-store';
import router from './router';

const store = configureStore({});

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        {router}
      </Provider>
    );
  }
}
