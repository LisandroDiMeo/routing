/** Calculate total distance for a tour given a distance matrix */
export function tourDistance(tour: number[], matrix: number[][]): number {
  let total = 0;
  for (let i = 0; i < tour.length - 1; i++) {
    total += matrix[tour[i]][tour[i + 1]];
  }
  return total;
}

/** Check if two tours visit the same sequence (or its reverse) */
export function toursAreSimilar(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;

  const aStr = a.join(",");
  const bStr = b.join(",");
  const bRevStr = [...b].reverse().join(",");

  return aStr === bStr || aStr === bRevStr;
}
