// import memoize from 'memoizee';
import { Promise } from 'es6-promise';
import { startLoading, stopLoading } from '../actions/loader';

export default (props) => {
  const
    { store, actions } = props,
    resolve = (location) => {
      let promise;

      if (actions && actions.length) {
        store.dispatch(startLoading());

        const promises = actions.map((fn) => {
          const action = fn(location);
          store.dispatch(action);
          return action.payload;
        });

        promise = Promise.all(promises)
          .then(() => store.dispatch(stopLoading()));
      } else {
        promise = Promise.resolve();
      }
      return promise;
    };

  const onEnter = (location, replace, cb) => resolve(location)
    .catch(cb)
    .then(() => cb());

  return Object.assign(props,
    props.resolve ? {} : { resolve },
    props.onEnter ? {} : { onEnter },
  );
};
