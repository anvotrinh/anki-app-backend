import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Loader } from 'semantic-ui-react';

const styles = {
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.5)',
    zIndex: 1,
  },
};

export default class Loading extends Component {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
  };
  
  render() {
    if (!this.props.isLoading) {
      return null;
    }
    return (
      <div style={styles.container}>
        <Loader active />
      </div>
    );
  }
}