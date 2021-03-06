/**
 * This is an implementation of BioVM (Biologocal Virtual Machine). It
 * is used for debugging "line" scripts.
 * 
 * @singleton
 * @author flatline
 */
import Store from './Store';
import {Actions} from './Actions';
import IrmaConfig from 'irma/src/Config';
//
// This is small hack. We have to apply default config before it will be
// used inside BioVM module. It's because it stores config values in constants
// and after apply of our values constants stay the same. We also should use
// require() instead import to import BioVM after applyCfg() call.
//
applyCfg();
const BioVM = require('irma/src/irma/BioVM');

/**
 * Instance of BioVM
 * @singleton
 */
let bioVM = null;
/**
 * Applies default configuration instead typed in Config component.
 * These parameters must overwrite typed by user
 */
function applyCfg() {
    Object.assign(IrmaConfig, Store.getState().config, {
        codeLinesPerIteration: 1,
        codeRepeatsPerRun    : 1,
        codeMutateEveryClone : 0,
        codeMutateMutations  : false,
        WORLD_USE_ZOOM       : false,
        WORLD_WIDTH          : 10,
        WORLD_HEIGHT         : 10,
        WORLD_CANVAS_WIDTH   : 10,
        WORLD_CANVAS_HEIGHT  : 10,
        WORLD_CANVAS_QUERY   : '#world',
        worldCanvasButtons   : false,
        DB_ON                : false,
        orgMutationPeriod    : 10000000,
        molAmount            : 5,
        PLUGINS              : []
    });
}
/**
 * Returns VM instance singleton
 */
function getVM () {
    return bioVM || (bioVM = new BioVM());
}
/**
 * Resets VM. After that code will be started from the beginning
 */
function reset() {
    const vm  = getVM();
    let   org = vm.orgs.get(0);
    vm.delOrg(org);
    org = vm.addOrg(0, IrmaConfig.LUCAS[0].code.slice(), 10000);
    vm.world.canvas.update();
    Store.dispatch(Actions.line(org.line));
}

Store.subscribe(applyCfg);
/**
 * Creates BioVM instance as a singleton
 */
export default {
    getVM,
    reset
}