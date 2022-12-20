import React, { useState, useEffect } from 'react';
import RandomLetter from './RandomLetter'; // The component we created earlier

// try to link variable change in css file but failed
// const element = document.querySelector("random-letter");
// const computedStyles = getComputedStyle(element);
// const width = computedStyles.width;
// const height = computedStyles.height;

function RandomLetterGrid() {
  const [numRows, setNumRows] = useState(0);
  const [numCols, setNumCols] = useState(0);

  useEffect(() => {
    function updateDimensions() {
      // Calculate the number of rows and columns that will fit in the window
      const rows = Math.floor(window.innerHeight / 20); // 50px is the height of each RandomLetter component
      const cols = Math.floor(window.innerWidth / 20); // 50px is the width of each RandomLetter component
      setNumRows(rows);
      setNumCols(cols);
    }

    // Update the number of rows and columns when the window is resized
    window.addEventListener('resize', updateDimensions);

    // Set the initial number of rows and columns
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Generate the grid of RandomLetter components
  const grid = [];
  for (let i = 0; i < numRows; i++) {
    const row = [];
    for (let j = 0; j < numCols; j++) {
      row.push(<RandomLetter key={`${i}-${j}`} />);
    }
    grid.push(<div key={i}>{row}</div>);
  }

  return (
    <div>
      {grid}
    </div>
  );
}

export default RandomLetterGrid;
