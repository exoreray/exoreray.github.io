import React, { useState, useEffect } from 'react';

function Grid() {
  const [grid, setGrid] = useState([]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Generate a new grid of random letters
      const newGrid = [];
      for (let i = 0; i < 10; i++) {
        const row = [];
        for (let j = 0; j < 10; j++) {
          row.push(String.fromCharCode(Math.floor(Math.random() * 26) + 'a'.charCodeAt(0)));
        }
        newGrid.push(row);
      }

      // Update the grid
      setGrid(newGrid);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      {grid.map((row, i) => (
        <div key={i}>
          {row.map((letter, j) => (
            <span key={j}>{letter}</span>
          ))}
        </div>
      ))}
    </div>
  );
}
export default Grid;
