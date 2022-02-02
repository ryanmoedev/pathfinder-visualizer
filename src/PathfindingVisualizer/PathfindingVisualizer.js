import { useEffect, useState } from "react";
import Node from "./Node/Node";
import { dijkstra, getNodesInShortestPathOrder } from "../algorithms/dijkstra";

import "./PathfindingVisualizer.css";

let start_node_row = 10;
let start_node_col = 15;
let finish_node_row = 10;
let finish_node_col = 35;

const PathfindingVisualizer = () => {
  const createNode = (col, row) => {
    return {
      col,
      row,
      isStart: row === start_node_row && col === start_node_col,
      isFinish: row === finish_node_row && col === finish_node_col,
      distance: Infinity,
      isVisited: false,
      isWall: false,
      previousNode: null,
    };
  };

  const initGrid = () => {
    const initialGrid = [];
    for (let row = 0; row < 20; row++) {
      const currentRow = [];
      for (let col = 0; col < 50; col++) {
        currentRow.push(createNode(col, row));
      }
      initialGrid.push(currentRow);
    }
    return initialGrid;
  };

  const getNewGridWithWallToggled = (oldGrid, row, col) => {
    const newGrid = oldGrid.slice();
    const node = newGrid[row][col];
    const newNode = {
      ...node,
      isWall: !node.isWall,
    };
    newGrid[row][col] = newNode;
    return newGrid;
  };

  const handleMouseDown = (row, col) => {
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setMouseIsPressed(true);
    setGrid(newGrid);
  };

  const handleMouseEnter = (row, col) => {
    if (!mouseIsPressed) return;
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setGrid(newGrid);
  };

  const handleMouseUp = () => {
    setMouseIsPressed(false);
  };

  const animateShortestPath = (nodesInShortestPathOrder) => {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className = "node node-shortest-path";
      }, 50 * i);
    }
  };

  const animateDijkstra = (visitedNodesInOrder, nodesInShortestPathOrder) => {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        const nodeToChange = document.getElementById(`node-${node.row}-${node.col}`);
        nodeToChange.className = "node node-visited";
      }, 10 * i);
    }
  };

  const visualizeDijkstra = () => {
    const startNode = grid[start_node_row][start_node_col];
    const finishNode = grid[finish_node_row][finish_node_col];
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
  };

  const reset = () => {
    setGrid(initGrid());
  };

  //STATES
  const [grid, setGrid] = useState(initGrid());
  const [mouseIsPressed, setMouseIsPressed] = useState(false);

  return (
    <div className="pathfinder-ctr">
      <h1>Pathfinding Visualizer</h1>
      <p>
        Click to create a <span className="wall-span">WALL</span>
      </p>
      <p>
        Drag <span className="start-span">START</span> and <span className="end-span">END</span>
      </p>
      <div className="button-ctr">
        <div className="small-button-ctr">
          <button>Random Wall</button>
          <button>Clear</button>
        </div>
        <button className="algo-button" onClick={() => visualizeDijkstra()}>
          Visualize Dijkstra's Algorithm
        </button>
      </div>
      {/* <button onClick={() => reset()}>Reset</button> */}
      <div className="grid">
        {grid.map((row, rowIdx) => {
          return (
            <div key={rowIdx}>
              {row.map((node, nodeIdx) => {
                const { row, col, isFinish, isStart, isWall } = node;
                return (
                  <Node
                    key={rowIdx + ":" + nodeIdx}
                    col={col}
                    isFinish={isFinish}
                    isStart={isStart}
                    isWall={isWall}
                    mouseIsPressed={mouseIsPressed}
                    onMouseDown={(row, col) => handleMouseDown(row, col)}
                    onMouseEnter={(row, col) => handleMouseEnter(row, col)}
                    onMouseUp={() => handleMouseUp()}
                    row={row}
                  ></Node>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PathfindingVisualizer;