# Dijkstra's Pathfinding Visualizer

An efficient, interactive implementation of Dijkstra’s Algorithm using a **Priority Queue (Min-Heap)** and features a dynamic, physics-based UI.

> * For more information about the algorithm, check out [CP-Algorithms: Dijkstra](https://cp-algorithms.com/graph/dijkstra.html).
> * Check out [guide](https://dijkstra-simulation2.vercel.app/th/guide) for how to use.

---

## Visual Representation
This project provides a real-time visualization of the pathfinding process:
*   **Graph Traversal:** Watch how the algorithm "spreads" and relaxes edges across the map.
*   **Path Highlights:** Once the target is reached, the optimal path is backtraced.
*   **Physics-Based Interaction:** Nodes are draggable and react to **physics forces**, allowing you to reorganize the graph layout dynamically.

---

## Core Features

*   **Optimal Path Guarantee**  
    Finds the mathematically shortest path between a source and any destination in a weighted graph.
*   **Custom Graphs**  
    Full support for both directed and undirected graphs with non-negative edge weights.
*   **Interactive Simulation**  
    Physics-driven node interactions make exploring complex graph structures intuitive and engaging.

---

## Installation & Setup

Get the project running locally in three simple steps:

1. **Clone the repository**
   ```bash
   git clone https://github.com/DetectiveGot/Dijkstra-Simulation2.git
   ```
2. **Install dependencies**
   ```bash
   pnpm i
   ```
3. **Run**
   ```bash
   pnpm dev
   ```

## Tech Stack

### Frontend & Logic
*   **Framework:** Next.js — For building the reactive user interface.
*   **Language:** TypeScript — Ensures type safety for complex graph data structures.
*   **Internationalization:** next-i18next — For English and Thai localizations.

### Graph Engine & Physics
*   **Graph Data Structure:** ngraph.graph — A high-performance graph data structure.
*   **Physics Simulation:** ngraph.forcelayout — A 2D force-directed layout engine that handles node repulsion and edge tension.

### Styling
*   **CSS:** Tailwind CSS — For rapid, responsive UI development.
*   **Components:** shadcn/ui — High-quality accessible components for the dashboard.