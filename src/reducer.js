import { combineReducers } from 'redux';
import { reducer as form } from 'redux-form';

const INITIAL_STATE = {
  all: {},
  record: {
    fullname: '',
    birthdate: new Date(1970, 1, 1).toUTCString(),
    address: '',
    city: '',
    phone: ''
  }
};

const records = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'SAVE_RECORD':
      return {
        ...state,
        all: {
          ...state.all,
          [action.id]: action.record
        },
      };

    case 'SET_RECORD':
      return {
        ...state,
        record: state.all[action.id] || INITIAL_STATE.record
      };

    case 'CLEAR_RECORD':
      return {
        ...state,
        record: INITIAL_STATE.record
      };

    case 'DELETE_RECORD':
      const all = { ...state.all };
      delete all[action.id];

      return {
        ...state,
        all
      };

    default:
      return state;
  }
};

export default combineReducers({
  form,
  records
});