/**
 * If returns true, then should abort the current async function.
 * @return {Boolean}
 */
export const thenErrorHelper = (err, then) => {
  if (err) {
    if (then) {
      then(err, null);
      return true;
    } else {
      throw err;
    }
  }
  return false;
};
