import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import Menu from '../views/Menu';
import hasToken from '../utils/has-token';

// eslint-disable-next-line
export default ({ component: Component, ...rest }) => {
  if (!hasToken()) {
    return (
      <Redirect
        to={{
          pathname: '/admin/login',
          state: { from: rest.location },
        }}
      />
    );
  }
  return (
    <Route
      {...rest}
      render={props => (
        <div>
          <Menu />
          <Component {...props} />
        </div>
      )}
    />
  );
};
