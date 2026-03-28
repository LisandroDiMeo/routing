import { tourDistance, toursAreSimilar } from "./helpers";

/** Nearest Neighbor heuristic starting from a given node */
export function nearestNeighbor(
  matrix: number[][],
  startNode: number
): number[] {
  const n = matrix.length;
  const visited = new Set<number>([startNode]);
  const tour = [startNode];

  while (visited.size < n) {
    const current = tour[tour.length - 1];
    let bestNext = -1;
    let bestDist = Infinity;

    for (let j = 0; j < n; j++) {
      if (!visited.has(j) && matrix[current][j] < bestDist) {
        bestDist = matrix[current][j];
        bestNext = j;
      }
    }

    if (bestNext === -1) break;
    tour.push(bestNext);
    visited.add(bestNext);
  }

  return tour;
}

/** 2-opt improvement: reverse segments to remove crossings */
export function twoOpt(tour: number[], matrix: number[][]): number[] {
  const n = tour.length;
  let improved = true;
  let best = [...tour];
  let bestDist = tourDistance(best, matrix);
  let iterations = 0;

  while (improved && iterations < 1000) {
    improved = false;
    iterations++;

    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 2; j < n; j++) {
        const newTour = [
          ...best.slice(0, i + 1),
          ...best.slice(i + 1, j + 1).reverse(),
          ...best.slice(j + 1),
        ];
        const newDist = tourDistance(newTour, matrix);

        if (newDist < bestDist) {
          best = newTour;
          bestDist = newDist;
          improved = true;
        }
      }
    }
  }

  return best;
}

interface SAOptions {
  initialTemp: number;
  coolingRate: number;
  maxIterations: number;
}

/** Simulated Annealing for TSP */
export function simulatedAnnealing(
  matrix: number[][],
  options: SAOptions
): number[] {
  const n = matrix.length;
  // Start with a random permutation
  let current = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [current[i], current[j]] = [current[j], current[i]];
  }

  let currentDist = tourDistance(current, matrix);
  let best = [...current];
  let bestDist = currentDist;
  let temp = options.initialTemp;

  for (let iter = 0; iter < options.maxIterations; iter++) {
    // Random 2-opt swap
    let i = Math.floor(Math.random() * n);
    let j = Math.floor(Math.random() * n);
    if (i > j) [i, j] = [j, i];
    if (i === j) continue;

    const candidate = [
      ...current.slice(0, i),
      ...current.slice(i, j + 1).reverse(),
      ...current.slice(j + 1),
    ];
    const candidateDist = tourDistance(candidate, matrix);
    const delta = candidateDist - currentDist;

    if (delta < 0 || Math.random() < Math.exp(-delta / temp)) {
      current = candidate;
      currentDist = candidateDist;

      if (currentDist < bestDist) {
        best = [...current];
        bestDist = currentDist;
      }
    }

    temp *= options.coolingRate;
  }

  return best;
}

interface GeneratedRoute {
  tour: number[];
  distance: number;
}

/** Generate multiple diverse route alternatives */
export function generateRoutes(
  matrix: number[][],
  count: number
): GeneratedRoute[] {
  const n = matrix.length;
  const candidates: GeneratedRoute[] = [];

  // Strategy 1: Nearest Neighbor from different starting points + 2-opt
  for (let start = 0; start < n && start < count + 2; start++) {
    const nnTour = nearestNeighbor(matrix, start);
    const optimized = twoOpt(nnTour, matrix);
    candidates.push({
      tour: optimized,
      distance: tourDistance(optimized, matrix),
    });
  }

  // Strategy 2: Simulated Annealing with different parameters
  const saConfigs: SAOptions[] = [
    { initialTemp: 10000, coolingRate: 0.9995, maxIterations: 5000 },
    { initialTemp: 5000, coolingRate: 0.999, maxIterations: 3000 },
    { initialTemp: 1000, coolingRate: 0.998, maxIterations: 2000 },
  ];

  for (const config of saConfigs) {
    const saTour = simulatedAnnealing(matrix, config);
    const optimized = twoOpt(saTour, matrix);
    candidates.push({
      tour: optimized,
      distance: tourDistance(optimized, matrix),
    });
  }

  // Sort by distance
  candidates.sort((a, b) => a.distance - b.distance);

  // Deduplicate similar tours
  const unique: GeneratedRoute[] = [];
  for (const candidate of candidates) {
    if (!unique.some((u) => toursAreSimilar(u.tour, candidate.tour))) {
      unique.push(candidate);
    }
    if (unique.length >= count) break;
  }

  return unique;
}
