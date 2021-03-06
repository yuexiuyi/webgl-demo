/**
 * The value is typed array
 * @param {*} val
 * @returns
 */
function isTypedArray(val) {
  if (val &&                                   // val is not null, undefined, etc.
      typeof val === 'object' &&               // val is not array
      !Array.isArray(val) &&               // val is an object
      isFinite(val.length) &&                  // val.length is a finite number
      val.length >= 0 &&                       // val.length is non-negative
      val.length===Math.floor(val.length) &&   // val.length is an integer
      val.length < 4294967296)                 // val.length < 2^32
      return true;                             // Then val is array-like
  else
      return false;                            // Otherwise it is not
}
