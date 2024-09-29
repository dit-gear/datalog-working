export function deepEqual(obj1, obj2) {
  // Check if both values are strictly equal
  if (obj1 === obj2) {
    return true
  }

  // Check if both values are objects and not null
  if (typeof obj1 === 'object' && obj1 !== null && typeof obj2 === 'object' && obj2 !== null) {
    // Check if both objects have the same number of keys
    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)
    if (keys1.length !== keys2.length) {
      return false
    }

    // Check if all keys and their corresponding values are equal
    for (let key of keys1) {
      if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
        return false
      }
    }

    return true
  }

  // If none of the above conditions are met, the objects are not equal
  return false
}

/* 
  
  **Usage Example:**
  
  const objectA = { name: "Alice", age: 30, address: { city: "Wonderland" } };
  const objectB = { name: "Alice", age: 30, address: { city: "Wonderland" } };
  const objectC = { name: "Bob", age: 25 };
  
  console.log(deepEqual(objectA, objectB)); // Output: true
  console.log(deepEqual(objectA, objectC)); // Output: false

  */
