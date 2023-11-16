import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Table, Loader, Button, Dropdown } from 'semantic-ui-react';
import { connect } from 'react-redux';
import moment from 'moment';

import { ServerErrorActions } from '../actions';
import { SERVER_ERROR_LANG } from '../constants';
import { isStatusLoading, toMultipleLine } from '../utils';
import Loading from './Loading';

class LongText extends Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
  }

  state = {
    opened: false,
  }

  _handleShowMore = () => {
    this.setState(state => ({
      opened: !state.opened,
    }));
  }

  render() {
    const { text } = this.props;
    const { opened } = this.state;
    const displayText = opened ? text : text.split('\n').slice(0, 2).join('\n');
    return (
      <Grid style={{ marginTop: 10 }}>
        <Grid.Row>
          <Grid.Column>
            {toMultipleLine(displayText)}
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column textAlign='right'>
            <Button onClick={this._handleShowMore} basic compact>
              {opened ? SERVER_ERROR_LANG.SHOW_LESS : SERVER_ERROR_LANG.SHOW_MORE}
            </Button>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

const mapStateToProps = state => ({
  serverErrors: state.serverErrors,
  listStatus: state.status.listServerError,
  editStatus: state.status.editServerError,
  removeStatus: state.status.removeServerError,
});
const mapDispatchToProps = dispatch => ({
  listServerError: () => dispatch(ServerErrorActions.listServerError()),
  editServerError: serverError => dispatch(ServerErrorActions.editServerError(serverError)),
  removeServerError: serverErrorId => dispatch(ServerErrorActions.removeServerError(serverErrorId)),
});

const styles = {
  cell: {
    wordBreak: 'break-all',
  },
};

class HomePage extends Component {
  static propTypes = {
    serverErrors: PropTypes.array.isRequired,
    listServerError: PropTypes.func.isRequired,
    listStatus: PropTypes.string.isRequired,
    editServerError: PropTypes.func.isRequired,
    editStatus: PropTypes.string.isRequired,
    removeServerError: PropTypes.func.isRequired,
    removeStatus: PropTypes.string.isRequired,
  };

  state = {
    dropdownValue: 'unresolved',
  }

  dropdownOptions = [{
    key: 0,
    text: 'Unresolved',
    value: 'unresolved',
  }, {
    key: 1,
    text: 'Resolved',
    value: 'resolved',
  }]

  componentDidMount() {
    this.props.listServerError();
  }

  _handleReload = () => {
    this.props.listServerError();
  }

  _handleResolve = error => {
    this.props.editServerError({
      id: error.id,
      resolved: !error.resolved,
    });
  }

  _handleRemove = serverErrorId => {
    this.props.removeServerError(serverErrorId);
  }

  _handleDropdownChange = (event, data) => {
    this.setState({ dropdownValue: data.value });
  }
  
  renderTable() {
    const { serverErrors } = this.props;
    const { dropdownValue } = this.state;
    const resolvedList = dropdownValue === 'resolved';
    const filterdServerErrors = serverErrors.filter(e => e.resolved === resolvedList);
    if (filterdServerErrors.length === 0) {
      return SERVER_ERROR_LANG.NO_ERROR;
    }
    return (
      <Table celled style={{ width: 1024 }}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width={1}>{SERVER_ERROR_LANG.DATE}</Table.HeaderCell>
            <Table.HeaderCell width={1}>{SERVER_ERROR_LANG.TITLE}</Table.HeaderCell>
            <Table.HeaderCell width={1}>{SERVER_ERROR_LANG.COUNT}</Table.HeaderCell>
            <Table.HeaderCell width={1}>{SERVER_ERROR_LANG.USER_IDS}</Table.HeaderCell>
            <Table.HeaderCell width={6}>{SERVER_ERROR_LANG.DETAIL}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {filterdServerErrors.map((error, index) => (
            <Table.Row key={index}>
              <Table.Cell style={styles.cell}>{moment(error.created_at).format('hh:mma,DMMMYYYY')}</Table.Cell>
              <Table.Cell style={styles.cell}>{error.title}</Table.Cell>
              <Table.Cell style={styles.cell}>{error.count}</Table.Cell>
              <Table.Cell style={styles.cell}>{toMultipleLine(error.user_ids)}</Table.Cell>
              <Table.Cell style={styles.cell}>
                <Button onClick={this._handleResolve.bind(this, error)} color={error.resolved ? 'blue' : 'green'}>
                  {error.resolved ? SERVER_ERROR_LANG.UNRESOLVE : SERVER_ERROR_LANG.RESOLVE}
                </Button>
                {error.resolved &&
                  <Button onClick={this._handleRemove.bind(this, error.id)} color='red'>
                    {SERVER_ERROR_LANG.REMOVE}
                  </Button>
                }
                <LongText text={error.detail} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    );
  }

  render() {
    const { listStatus, editStatus, removeStatus } = this.props;
    const { dropdownValue } = this.state;
    return (
      <Grid centered>
        <Loading isLoading={isStatusLoading(editStatus) || isStatusLoading(removeStatus)} />
        <Grid.Row style={{ marginTop: 10 }}>
          <Grid.Column verticalAlign='middle'>
            <Button onClick={this._handleReload}>{SERVER_ERROR_LANG.RELOAD}</Button>
          </Grid.Column>
          <Grid.Column width={2}>
            <Dropdown
              value={dropdownValue}
              onChange={this._handleDropdownChange}
              placeholder='Select'
              fluid
              selection
              options={this.dropdownOptions}
            />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          {isStatusLoading(listStatus) ?
            <Loader size='small' active/>
            :
            this.renderTable()
          }
        </Grid.Row>
      </Grid>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
