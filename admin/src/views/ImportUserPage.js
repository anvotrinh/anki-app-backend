import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Grid, Table, Icon, Loader, Input } from 'semantic-ui-react';
import Papa from 'papaparse';

import { UserActions } from '../actions';
import { isValidEmail, isValidName, isValidPassword, isValidDate, isStatusSuccess, isStatusError } from '../utils';
import { IMPORT_USER_LANG } from '../constants';

const inputFields = {
  email: {
    validator: isValidEmail,
    msg: IMPORT_USER_LANG.INVALID_EMAIL,
  },
  name: {
    validator: isValidName,
    msg: IMPORT_USER_LANG.INVALID_NAME,
  },
  password: {
    validator: isValidPassword,
    msg: IMPORT_USER_LANG.INVALID_PASSWORD,
  },
  birthday: {
    validator: isValidDate,
    msg: IMPORT_USER_LANG.INVALID_BIRTHDAY,
  },
};

const mapStateToProps = state => ({
  uploadStatus: state.status.uploadUser,
  uploadError: state.error.uploadUser,
});
const mapDispatchToProps = dispatch => ({
  uploadUser: input => dispatch(UserActions.uploadUser(input)),
});

class HomePage extends Component {
  static propTypes = {
    uploadStatus: PropTypes.string.isRequired,
    uploadError: PropTypes.string,
    uploadUser: PropTypes.func.isRequired,
  };

  state = {
    users: [],
  };

  curUserIndex = -1;

  tbody = React.createRef();

  componentDidUpdate(prevProps) {
    const { uploadStatus, uploadError } = this.props;
    let status;
    if (isStatusSuccess(prevProps.uploadStatus, uploadStatus)) {
      status = 'success';
    } else if (isStatusError(prevProps.uploadStatus, uploadStatus)) {
      status = uploadError;
    }
    if (!status) {
      return;
    }
    this._setUserStatus(this.curUserIndex, status);
    this._uploadNextUser();
  }

  _validate = user => {
    const errMsgs = [];
    for (let key in inputFields) {
      const { validator, msg } = inputFields[ key ];
      if (!validator(user[ key ])) {
        errMsgs.push(msg);
      }
    }
    return errMsgs.join('\n');
  }

  _handleFileChange = event => {
    Papa.parse(event.target.files[ 0 ], {
      complete: this._handleFileParsed,
      header: true,
      skipEmptyLines: 'greedy',
    });
  };

  _handleStartClick = async () => {
    const { users } = this.state;
    if (!users.length) {
      alert(IMPORT_USER_LANG.NO_USER_WARNING);
      return;
    }
    this._uploadNextUser();
  };

  _handleFileParsed = result => {
    this.curUserIndex = -1;
    const users = result.data.map(user => ({
      ...user,
      status: this._validate(user),
    }));
    this.setState({ users });
  };

  _setUserStatus = (index, status) => {
    this.setState(state => {
      return {
        users: [
          ...state.users.slice(0, index),
          {
            ...state.users[ index ],
            status,
          },
          ...state.users.slice(index + 1),
        ],
      };
    });
  };

  _uploadNextUser = () => {
    const { users } = this.state;
    if (this.curUserIndex >= users.length - 1) {
      return;
    }
    this.curUserIndex++;
    const curUser = users[ this.curUserIndex ];
    if (curUser.status) {
      this._uploadNextUser();
      return;
    }
    window.scrollTo({
      top: this.tbody.current.children[ this.curUserIndex ].offsetTop,
      left: 0,
      behavior: 'smooth',
    });
    this._setUserStatus(this.curUserIndex, 'loading');
    this.props.uploadUser(curUser);
  }

  _renderStatus(status) {
    switch (status) {
      case '':
        return <Icon size='small' name='play' circular color='blue' inverted />;
      case 'loading':
        return <Loader size='small' active inline />;
      case 'success':
        return <Icon size='small' name='check' circular color='green' inverted />;
      default:
        return <pre style={{ color: 'red', width: 300, whiteSpace: 'pre-wrap', wordBreak: 'normal' }}>{status}</pre>;
    }
  }

  _renderUser(user, index) {
    const { email, name, birthday, password, status } = user;
    return (
      <Table.Row key={index}>
        <Table.Cell>{email}</Table.Cell>
        <Table.Cell>{name}</Table.Cell>
        <Table.Cell>{birthday}</Table.Cell>
        <Table.Cell>{password}</Table.Cell>
        <Table.Cell>{this._renderStatus(status)}</Table.Cell>
      </Table.Row>
    );
  }

  render() {
    const { users } = this.state;
    return (
      <Grid centered>
        <Grid.Row style={{ marginTop: 10 }}>
          <Grid.Column verticalAlign='middle'>
            <Input
              type='file'
              accept='text/csv'
              onChange={this._handleFileChange}
              style={{ marginRight: 10 }}
            />
            <Button onClick={this._handleStartClick}>{IMPORT_USER_LANG.START}</Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Table celled style={{ width: 1024 }}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width={3}>{IMPORT_USER_LANG.EMAIL_ADDRESS}</Table.HeaderCell>
                <Table.HeaderCell width={3}>{IMPORT_USER_LANG.NAME}</Table.HeaderCell>
                <Table.HeaderCell width={3}>{IMPORT_USER_LANG.BIRTHDAY}</Table.HeaderCell>
                <Table.HeaderCell width={3}>{IMPORT_USER_LANG.PASSWORD}</Table.HeaderCell>
                <Table.HeaderCell width={2}>{IMPORT_USER_LANG.STATUS}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <tbody ref={this.tbody}>
              {users.map((user, i) => this._renderUser(user, i))}
            </tbody>
          </Table>
        </Grid.Row>
      </Grid>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
