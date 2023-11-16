import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Grid, Header, Segment, Message } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { AuthActions } from '../actions';
import { isStatusSuccess, isStatusLoading } from '../utils';
import hasToken from '../utils/has-token';
import { LOGIN_LANG } from '../constants';

const mapStateToProps = state => ({
  loginStatus: state.status.login,
  loginError: state.error.login,
});
const mapDispatchToProps = dispatch => ({
  login: (email, password) => dispatch(AuthActions.login(email, password)),
});

class LoginPage extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    loginStatus: PropTypes.string.isRequired,
    loginError: PropTypes.string,
    login: PropTypes.func.isRequired,
  };

  state = {
    email: '',
    password: '',
  };

  componentDidUpdate(prevProps) {
    const { loginStatus, history, location } = this.props;
    if (isStatusSuccess(prevProps.loginStatus, loginStatus)) {
      const { state } = location;
      let pathname = '/admin';
      if (state) {
        pathname = state.from;
      }
      history.push(pathname);
    }
  }

  _handleLoginClick = () => {
    const { email, password } = this.state;
    this.props.login(email, password);
  };

  _handleEmailChange = e => {
    this.setState({ email: e.target.value });
  };

  _handlePasswordChange = e => {
    this.setState({ password: e.target.value });
  };

  render() {
    if (hasToken()) {
      return <Redirect to={{ pathname: '/admin' }} />;
    }

    const { loginStatus, loginError } = this.props;
    const { email, password } = this.state;

    return (
      <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as='h2' color='teal' textAlign='center'>
            {LOGIN_LANG.LOGIN}
          </Header>
          <Form size='large'>
            <Segment stacked>
              <Form.Input
                fluid
                icon='user'
                iconPosition='left'
                placeholder={LOGIN_LANG.EMAIL_ADDRESS_PLACEHOLDER}
                autoComplete='username'
                value={email}
                onChange={this._handleEmailChange}
              />
              <Form.Input
                fluid
                icon='lock'
                iconPosition='left'
                placeholder={LOGIN_LANG.PASSWORD_PLACEHOLDER}
                type='password'
                autoComplete='current-password'
                value={password}
                onChange={this._handlePasswordChange}
              />
              <Message
                negative
                error={!loginError}
                content={loginError}
              />
              <Button
                fluid
                size='large'
                color='teal'
                loading={isStatusLoading(loginStatus)}
                onClick={this._handleLoginClick}
              >
                {LOGIN_LANG.LOGIN}
              </Button>
            </Segment>
          </Form>
        </Grid.Column>
      </Grid>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
