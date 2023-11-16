import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Menu } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';

import { AuthActions, ProfileActions } from '../actions';
import { isStatusError } from '../utils';
import { IMPORT_USER_LANG, IMPORT_QUESTION_LANG, COMMON_LANG, QUESTION_CSV_LANG, SERVER_ERROR_LANG } from '../constants';

const mapStateToProps = state => ({
  profile: state.profile,
  getProfileStatus: state.status.getProfile,
});
const mapDispatchToProps = dispatch => ({
  getProfile: () => dispatch(ProfileActions.getProfile()),
  logout: () => dispatch(AuthActions.logout()),
});

const menuItems = [
  { pathname: '/admin/import-users', name: IMPORT_USER_LANG.TITLE },
  { pathname: '/admin/import-questions', name: IMPORT_QUESTION_LANG.TITLE },
  { pathname: '/admin/question-csv', name: QUESTION_CSV_LANG.TITLE },
  { pathname: '/admin/server-errors', name: SERVER_ERROR_LANG.TITLE },
];

class CustomMenu extends PureComponent {
  static propTypes = {
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    profile: PropTypes.object,
    getProfileStatus: PropTypes.string.isRequired,
    getProfile: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.props.getProfile();
  }

  componentDidUpdate(prevProps) {
    const { getProfileStatus } = this.props;
    if (isStatusError(prevProps.getProfileStatus, getProfileStatus)) {
      this.props.logout();
    }
  }

  _handleLogoutClick = () => {
    const { history, logout } = this.props;
    logout();
    history.push('/admin/login');
  };

  render() {
    const { profile, location } = this.props;

    return (
      <Menu fixed='top' inverted>
        <Menu.Item header>{COMMON_LANG.TITLE}</Menu.Item>
        {menuItems.map((menuItem, i) => (
          <Link key={i} to={menuItem.pathname}>
            <Menu.Item active={menuItem.pathname === location.pathname}>
              {menuItem.name}
            </Menu.Item>
          </Link>
        ))}
        {profile && 
          <Menu.Menu position='right'>
            <Dropdown item simple text={profile.name} >
              <Dropdown.Menu>
                <Dropdown.Item onClick={this._handleLogoutClick} target="_blank">{COMMON_LANG.LOGOUT}</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Menu>
        }
      </Menu>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CustomMenu));
