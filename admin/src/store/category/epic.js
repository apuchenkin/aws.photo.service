import 'rxjs/add/operator/mergeMap';
import { combineEpics } from 'redux-observable';
import {
  LOAD, CREATE, UPDATE, REMOVE,
  loaded, created, updated, removed,
} from './actions';

const load = (action, store) =>
  action
    .ofType(LOAD)
    .mergeMap(() => store.getState().runtime
      .categoryService.fetchCategories()
      .then(loaded),
    )
;

const create = (action, store) =>
  action
    .ofType(CREATE)
    .mergeMap(({ data }) => store.getState().runtime
      .categoryService.create(data)
      .then(created),
    )
;

const update = (action, store) =>
  action
    .ofType(UPDATE)
    .mergeMap(({ category, data }) => store.getState().runtime
      .categoryService.update(category, data)
      .then(updated),
    )
;

const remove = (action, store) =>
  action
    .ofType(REMOVE)
    .mergeMap(({ category }) => store.getState().runtime
      .categoryService.delete(category)
      .then(() => removed(category)),
    )
;

export default combineEpics(
  load,
  create,
  update,
  remove,
);
