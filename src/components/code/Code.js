import React from 'react';
import './Code.scss';
import Store from './../../Store';
import {Actions} from './../../Actions';
import Bytes2Code from 'irma/src/irma/Bytes2Code';

class Code extends React.Component {
  constructor() {
    super();
    this.state = {code: Store.getState().code};
    this._map  = this._cmdMap();
  }

  componentDidMount() {
    this.unsubscribe = Store.subscribe(() => {
      this.setState({code: Store.getState().code});
    });
  }

  componentWillUnmount() {this.unsubscrube()}

  render () {
    const validCls = this._isValid(this.state.config) ? '' : 'error';
    const onChange = this._onChange.bind(this);
    const errMsg   = validCls ? 'Invalid configuration' : '';
    const value    = this.state.code;

    return (
      <div className="code">
        <div className="rows"></div>
        <textarea title={errMsg} className={validCls} value={value} onChange={onChange}></textarea>
      </div>
    );
  }

  _isValid() {
    const code = this.state.code.split('\n');
    const map  = this._map;

    for (let i = 0, len = code.length; i < len; i++) {
      if (map[code[i]] === undefined) {return false}
    }

    return true;
  }

  _onChange(e) {
    Store.dispatch(Actions.code(e.target.value));
  }

  _cmdMap() {
    const map       = Bytes2Code.MAP;
    const revertMap = {};
    const keys      = Object.keys(map);

    for (let i = 0, len = keys.length; i < len; i++) {
      revertMap[map[keys[i]][0]] = keys[i];
    }

    return revertMap;
  }
}

export default Code;