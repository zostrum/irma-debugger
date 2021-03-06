/**
 * Actions for Redux
 * 
 * @author flatline
 */
import Constants from './Constants';

export const Actions = {
  config: value => ({type: Constants.CONFIG, value}),
  code  : value => ({type: Constants.CODE, value}),
  line  : value => ({type: Constants.LINE, value})
};