import React from 'react';
import ReactDOM from 'react-dom';
import './Code.scss';
import Store from './../../Store';
import {Actions} from './../../Actions';
import Bytes2Code from 'irma/src/irma/Bytes2Code';
import IrmaConfig from 'irma/src/Config';
import BioVM from './../../BioVM';

const CLS_LINE  = 'line';
const CLS_MOL   = 'mol';
const CLS_READ  = 'read';
const CLS_WRITE = 'write';
const CLS_ERROR = 'error';

class Code extends React.Component {
    constructor() {
        super();
        const code     = Store.getState().code;
        const sCode    = !code ? Bytes2Code.toCode(IrmaConfig.LUCAS[0].code, false, false, false, false) : Bytes2Code.toCode(Bytes2Code.toByteCode(code), false, false, false, false);
        const bCode    = Bytes2Code.toByteCode(sCode);
        // TODO: refactor this to use separate reducers
        this.state     = {code: sCode, bCode, line: 0};
        this._oldCode  = this.state.code;
        this._linesMap = {};
        this._rendered = false;
        this._changed  = false;
        // TODO: refactor this to use separate reducers
        this._line     = 0;
        Store.dispatch(Actions.code(sCode, bCode));
    }

    componentDidMount() {
        this._updateByteCode();
        this.unsubscribe = Store.subscribe(() => {
            const state = Store.getState();
            //
            // If LUCA code has changed, then we have to update Code component
            // otherwise, it should store it's own code
            //
            if (this._oldCode !== state.code) {
                Store.dispatch(Actions.code(this._oldCode = state.code, Bytes2Code.toByteCode(state.code)));
                this._updateByteCode();
            }
            this.setState({code: state.code, line: state.line});
        });
    }

    componentWillUnmount() {this.unsubscribe()}

    componentDidUpdate() {
        if (this.state.line === this._line) {return}

        const rootEl = ReactDOM.findDOMNode(this);
        const lineEl = rootEl.querySelector(`.${CLS_LINE}`);
        const rowsEl = lineEl.parentNode;
        const pos    = lineEl.offsetTop - rowsEl.scrollTop;
        if (pos >= (rowsEl.clientHeight - 20) || pos <= 0) {
            rootEl.querySelector('textarea').scrollTop = (lineEl.parentNode.scrollTop += (pos - 30));
        }
        this._line = this.state.line;
        this._changed = false;
    }

    render () {
        const validCls = this._isValid(this.state.code) ? '' : CLS_ERROR;
        const onChange = this._onChange.bind(this);
        const errMsg   = validCls ? 'Invalid code' : '';
        const value    = this.state.code;
        const onScroll = this._onScroll.bind(this);
        const lines    = this._lines(value);
        const map      = this._linesMap;
        const curLine  = map[this.state.line];
        const org      = this._rendered ? BioVM.getVM().orgs.get(0) : {};
        const mol      = lines[map[org.mol      || 0]][1];
        const molRead  = lines[map[org.molRead  || 0]][1];
        const molWrite = lines[map[org.molWrite || 0]][1];

        this._rendered = true;

        return (
            <div className="code">
                <div className="rows">
                    {lines.map((line,i) => <div key={i} className="row">
                        <div className={i === curLine ? CLS_LINE : ''}>{line[0]}</div>
                        <div className={line[1] === molWrite ? CLS_WRITE  : (line[1] === molRead ? CLS_READ : (line[1] === mol ? CLS_MOL : ''))}>{line[1]}</div>
                    </div>)}
                </div>
                <textarea title={errMsg} className={validCls} value={value} onChange={onChange} onScroll={onScroll}></textarea>
            </div>
        );
    }

    /**
     * Makes string code validation
     * @return {Boolean} Validation status
     */
    _isValid() {
        if (this.state.code === '') {return true}
        const code = this.state.code.split('\n');

        for (let i = 0, len = code.length; i < len; i++) {
            if (!Bytes2Code.valid(code[i])) {return false}
        }

        return true;
    }

    _isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    _onChange(e) {
        this._changed = true;
        const bCode = Bytes2Code.toByteCode(e.target.value);
        const code  = Bytes2Code.toCode(bCode, false, false, false, false);
        Store.dispatch(Actions.code(code, bCode));
        BioVM.reset();
    }

    _onScroll(e) {
        const target = e.nativeEvent.target;
        target.parentNode.firstChild.scrollTop = target.scrollTop;
    }

    _lines(code) {
        const splitted = code.split('\n');
        const len      = splitted.length;
        const lines    = new Array(len + 1);
        let   line     = -1;
        let   mol      = 0;

        for (let i = 0; i < len; i++) {
            const ln = lines[i] = new Array(2);
            if (Bytes2Code.byte(splitted[i]) === null) {
                ln[0] = '\u0000';
                ln[1] = '\u0000';
            } else {
                this._linesMap[++line] = i;
                ln[0] = line;
                ln[1] = Bytes2Code.isMol(splitted[i]) ? mol++ : mol;
            }
        }
        lines[len] = [++line];
        this._linesMap[line] = len;

        return lines;
    }

    _updateByteCode() {
        const org = BioVM.getVM().orgs.get(0);
        org.code  = Store.getState().bCode.slice();
        this._changed && org.compile();
    }
}

export default Code;