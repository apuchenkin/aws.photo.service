export const SET_RUNTIME_VARIABLE = 'SET_RUNTIME_VARIABLE';

export function setRuntimeVariable(name, value) {
  return {
    type: SET_RUNTIME_VARIABLE,
    name,
    value,
  };
}
