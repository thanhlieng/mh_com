/**
 * Update an object partially
 * @param oldObj Object to be updated
 * @param newObj Update fields
 */
export function CommonUpdate<T>(oldObj: any, newObj: any): T {
  for (const [key, value] of Object.entries(newObj)) {
    if (key in oldObj) {
      oldObj[key] = value;
    }
  }
  return oldObj;
}
