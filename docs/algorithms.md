# Route Optimization Algorithms

The app solves a variant of the Traveling Salesman Problem (TSP) to find the shortest route through all stops. Since TSP is NP-hard, the app uses heuristic and metaheuristic approaches to generate good (not necessarily optimal) solutions quickly on-device.

## Algorithms

### Nearest Neighbor

A greedy constructive heuristic.

**How it works:**
1. Start at a given node.
2. Move to the nearest unvisited node.
3. Repeat until all nodes are visited.

**Complexity:** O(n^2)

**Strengths:** Very fast, produces a reasonable baseline tour.

**Weaknesses:** Tends to leave long edges at the end. Quality depends heavily on the starting node.

**Usage in the app:** Run from every possible starting node to generate multiple candidate tours.

### 2-Opt

A local search improvement heuristic.

**How it works:**
1. Take an existing tour.
2. For each pair of edges, check if reversing the segment between them shortens the tour.
3. If an improvement is found, apply it and restart the search.
4. Stop when no more improvements can be found (local optimum) or after 1,000 iterations.

**Complexity:** O(n^2) per iteration, up to 1,000 iterations.

**Strengths:** Effectively removes route crossings. Simple to implement and reliable.

**Weaknesses:** Can get stuck in local optima. Cannot rearrange the order of distant segments.

**Usage in the app:** Applied as a polishing step on every tour produced by Nearest Neighbor and Simulated Annealing.

### Simulated Annealing

A probabilistic metaheuristic for global optimization.

**How it works:**
1. Start with a random permutation of all stops.
2. At each step, generate a neighbor solution by reversing a random segment (2-opt move).
3. If the neighbor is better, accept it.
4. If the neighbor is worse, accept it with probability `exp(-delta / temperature)`.
5. Gradually decrease the temperature, reducing the chance of accepting worse solutions.
6. Track the best solution seen across all iterations.

**Parameters used:**

| Config | Initial Temp | Cooling Rate | Max Iterations |
|--------|-------------|--------------|----------------|
| Hot    | 10,000      | 0.9995       | 5,000          |
| Medium | 5,000       | 0.999        | 3,000          |
| Cool   | 1,000       | 0.998        | 2,000          |

Three different temperature schedules are used to increase solution diversity.

**Strengths:** Can escape local optima by accepting worse solutions early on. Good at exploring the solution space broadly.

**Weaknesses:** Stochastic -- results vary between runs. Slower than greedy heuristics.

**Usage in the app:** Run with three different parameter configurations to produce diverse candidate tours.

## Route Generation Pipeline

The `generateRoutes()` function orchestrates all algorithms:

```
1. Nearest Neighbor from each starting node (up to count+2 tours)
   -> Polish each with 2-Opt

2. Simulated Annealing with 3 temperature configurations
   -> Polish each with 2-Opt

3. Merge all candidate tours

4. Sort by total distance (ascending)

5. Deduplicate
   - Two tours are "similar" if they visit stops in the same or reversed order

6. Return the top N distinct tours
```

By default, the app requests 3 routes. The user can request 3 more with "Find more routes," which calls `generateRoutes()` again and appends new unique alternatives.

## Distance Matrix

Before running any TSP algorithm, the app fetches a complete distance matrix from OSRM:

```
Stops: [A, B, C, D]

         A      B      C      D
A  [     0   1000   2500   3200 ]
B  [ 1000      0   1500   2100 ]
C  [ 2500   1500      0   1200 ]
D  [ 3200   2100   1200      0 ]
```

This matrix uses real road distances (not straight-line), so the TSP solutions account for actual road networks. The matrix also includes travel durations, which are used for display but not for optimization (routes are optimized by distance).

## Tour Similarity Detection

To avoid showing the user near-identical routes, tours are compared for similarity:

- Tour A is similar to Tour B if they visit the same sequence of stops.
- Tour A is also similar to Tour B if one is the reverse of the other (since the tour is a cycle, direction doesn't matter for total distance).

This deduplication ensures each presented route is meaningfully different.
