import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field, formValueSelector, reset, change } from 'redux-form';
import uuidV1 from 'uuid/v1';

const FORM = 'phone-form';
const selector = formValueSelector(FORM);

const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const years = [];
for (let year = 1950; year < 2007; year++) {
  years.push(year);
}

const getDaysInMonth = (month, year) => {
  let daysInMonth = 31;

  if ([4, 6, 8, 9, 11].indexOf(+month) !== -1) {
    daysInMonth = 30;
  }

  if(+month === 2) {
    daysInMonth = year % 4 === 0 ? 29 : 28;
  }

  return daysInMonth;
};

const validate = values => {
  const errors = {};

  if (!values.fullname) {
    errors.fullname = 'Заполните имя'
  } else if (values.fullname.length > 100) {
    errors.fullname = 'Не больше 100 знаков'
  }

  if (!values.phone) {
    errors.phone = 'Заполните телефон'
  } else if (!/^\d{10}$/.test(values.phone)) {
    errors.phone = '10 цифр'
  }

  return errors;
};

const renderField = ({ input, label, type, meta: { touched, error, warning } }) => (
  <div className="form-group">
    <div className="label">{label}</div>
    <div>
      <input {...input} placeholder={label} type={type}/>
      {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
    </div>
  </div>
);

@connect((state) => {
  const records = state.records.all;
  const { day, month, year } = selector(state, 'day', 'month', 'year');
  const { birthdate, ...record } = state.records.record;

  const date = new Date(birthdate);

  const initialValues = {
    ...record,
    day: date.getDay(),
    month: date.getMonth(),
    year: date.getFullYear()
  };

  return {
    records,
    day,
    month,
    year,
    initialValues
  };
})
@reduxForm({
  form: FORM,
  enableReinitialize: true,
  validate
})
export default class App extends Component {
  constructor(...args) {
    super(...args);

    this.savePhone = ::this.savePhone;
  }

  componentWillReceiveProps(nextProps) {
    const { day, dispatch } = this.props;

    const nextDaysInMonth = getDaysInMonth(nextProps.month, nextProps.year);

    if (day > nextDaysInMonth) {
      dispatch(change(FORM, 'day', 1));
    }
  }

  savePhone(values) {
    const { dispatch } = this.props;
    const { day, month, year, ...record } = values;
    record.birthdate = new Date(+year, +month, +day).toUTCString();

    if (!record.id) {
      record.id = uuidV1();
    }

    dispatch({
      type: 'SAVE_RECORD',
      id: record.id,
      record
    });
    dispatch({ type: 'CLEAR_RECORD' });
    dispatch(reset(FORM));
  }

  render() {
    const { records, handleSubmit, month, year, dispatch } = this.props;

    const daysInMonth =  getDaysInMonth(month, year);

    const days = [];
    for (let day = 1; day <= daysInMonth; day++ ) {
      days.push(day);
    }

    const list = [];
    for (const prop in records){
      if (records.hasOwnProperty(prop)) {
        const record = records[prop];
        list.push(
          <div key={prop}>
            {record.fullname} {record.phone}
            <button onClick={() => dispatch({ type: 'SET_RECORD', id: prop })}>Edit</button>
            <button onClick={() => dispatch({ type: 'DELETE_RECORD', id: prop })}>Delete</button>
          </div>
        );
      }
    }

    return (
      <div>
        <form onSubmit={handleSubmit(this.savePhone)}>
          <Field name="fullname" placeholder="ФИО" component={renderField} label="ФИО" />
          <div className="form-group">
            <div className="label">Дата рождения:</div>
            <div>
              <Field name="day" component="select">
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </Field>
              <Field name="month" component="select">
                {months.map((month, index) => (
                  <option key={month} value={index}>{month}</option>
                ))}
              </Field>
              <Field name="year" component="select">
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Field>
            </div>
          </div>
          <Field name="address" placeholder="Адрес" component={renderField} label="Адрес" />
          <Field name="city" placeholder="Город" component={renderField} label="Город" />
          <Field name="phone" placeholder="Телефон" component={renderField} label="Телефон" />
          <button>Save</button>
        </form>
        <div>{list}</div>
      </div>
    );
  }
}