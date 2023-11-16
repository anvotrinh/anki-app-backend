import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../views/LoginPage';
import HomePage from '../views/HomePage';
import ImportUserPage from '../views/ImportUserPage';
import ImportQuestionPage from '../views/ImportQuestionPage';
import QuestionCSVPage from '../views/QuestionCSVPage';
import ServerErrorPage from '../views/ServerErrorPage';

export default (
  <BrowserRouter>
    <Switch>
      <Route path='/admin/login' component={LoginPage} />
      <ProtectedRoute exact path='/admin/' component={HomePage} />
      <ProtectedRoute path='/admin/import-users' component={ImportUserPage} />
      <ProtectedRoute path='/admin/import-questions' component={ImportQuestionPage} />
      <ProtectedRoute path='/admin/question-csv' component={QuestionCSVPage} />
      <ProtectedRoute path='/admin/server-errors' component={ServerErrorPage} />
      <Route render={() => 'Notfound'} />
    </Switch>
  </BrowserRouter>
);
