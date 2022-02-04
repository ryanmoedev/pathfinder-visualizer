import { useState } from "react";
import Node from "./Node/Node";
import { dijkstra, getNodesInShortestPathOrder } from "../algorithms/dijkstra";

import "./PathfindingVisualizer.css";

let start_node_row = 10;
let start_node_col = 15;
let finish_node_row = 10;
let finish_node_col = 35;

let ranAlgorithm = false;

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

  const clear = (randomWall) => {
    ranAlgorithm = false;
    setGrid(initGrid());
    let newGrid = grid.slice();
    for (let i = 0; i < grid.length; i++) {
      let row = grid[i];
      for (let j = 0; j < row.length; j++) {
        if (grid[i][j].isStart || grid[i][j].isFinish) continue;
        const nodeToChange = document.getElementById(`node-${i}-${j}`);
        if (randomWall) {
          if (Math.random() < 0.3) {
            newGrid = getNewGridWithWallToggled(newGrid, i, j);
            nodeToChange.className = "node node-wall";
          }
        } else {
          nodeToChange.className = "node";
        }
      }
    }
    if (randomWall) setGrid(newGrid);
  };

  const getNewGridWithNewPoint = (oldGrid, newRow, newCol, oldPoint) => {
    const newGrid = oldGrid.slice();
    const node = newGrid[newRow][newCol];
    const oldNode =
      oldPoint === "start" ? newGrid[start_node_row][start_node_col] : newGrid[finish_node_row][finish_node_col];
    const newNode = { ...node };
    const replacementNode = { ...oldNode };
    if (oldPoint === "start") {
      newNode.isStart = true;
      replacementNode.isStart = false;
      newGrid[start_node_row][start_node_col] = replacementNode;
      start_node_row = newRow;
      start_node_col = newCol;
    } else if (oldPoint === "finish") {
      newNode.isFinish = true;
      replacementNode.isFinish = false;
      newGrid[finish_node_row][finish_node_col] = replacementNode;
      finish_node_row = newRow;
      finish_node_col = newCol;
    }
    newGrid[newRow][newCol] = newNode;
    return newGrid;
  };

  const handleMouseDown = (row, col) => {
    if (ranAlgorithm) {
      clear(false);
    }
    if (grid[row][col].isStart) {
      setGrabbed("start");
    } else if (grid[row][col].isFinish) {
      setGrabbed("finish");
    } else {
      const newGrid = getNewGridWithWallToggled(grid, row, col);
      setGrid(newGrid);
    }
    setMouseIsPressed(true);
  };

  const handleMouseEnter = (row, col) => {
    if (!mouseIsPressed) return;
    if (grabbed) {
      const newGrid = getNewGridWithNewPoint(grid, row, col, grabbed);
      setGrid(newGrid);
    } else {
      const newGrid = getNewGridWithWallToggled(grid, row, col);
      setGrid(newGrid);
    }
  };

  const handleMouseUp = () => {
    setMouseIsPressed(false);
    setGrabbed("");
  };

  const animateShortestPath = (nodesInShortestPathOrder) => {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      const node = nodesInShortestPathOrder[i];
      if (node.isFinish || node.isStart) continue;
      setTimeout(() => {
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
      const node = visitedNodesInOrder[i];
      if (node.isFinish || node.isStart) continue;
      setTimeout(() => {
        const nodeToChange = document.getElementById(`node-${node.row}-${node.col}`);
        nodeToChange.className = "node node-visited";
      }, 10 * i);
    }
  };

  const visualizeDijkstra = () => {
    ranAlgorithm = true;
    const startNode = grid[start_node_row][start_node_col];
    const finishNode = grid[finish_node_row][finish_node_col];
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
  };

  //STATES
  const [grid, setGrid] = useState(initGrid());
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [grabbed, setGrabbed] = useState("");

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
          <button onClick={() => clear(true)}>Random Wall</button>
          <button className="clear-button" onClick={() => clear(false)}>
            Clear
          </button>
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
