import React from 'react';
import ReactDOM from 'react-dom';
import Router from 'react-router/lib/Router';
import match from 'react-router/lib/match';
import history from 'react-router/lib/browserHistory';
import { IntlProvider, addLocaleData }  from 'react-intl';
import ruLocaleData from 'react-intl/locale-data/ru';

import routes from './routes';
import config from './config';

import './assets/fontello/css/fontello.css';
import './style/main.less';

addLocaleData(ruLocaleData);

function createElement(Component, props) {
  return <Component {...props} {...props.route.props} />;
}

const isBrowser = (typeof window !== 'undefined');
const initialState = isBrowser && window.__INITIAL_STATE__ || {};
const locale = initialState.locale || config.fallbackLocale;

match({ history, routes}, (error, redirectLocation, renderProps) => {
  ReactDOM.render(
    <IntlProvider locale={locale} messages={initialState.messages}>
      <Router {...renderProps} createElement={createElement} />
    </IntlProvider>,
    document.getElementById('react-view')
  );
});
