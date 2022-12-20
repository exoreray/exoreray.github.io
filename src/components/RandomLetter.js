import React, { useState, useEffect } from 'react';

function RandomLetter() {
  // Declare a state variable called "letter" with an initial value of "A"
  const [letter, setLetter] = useState('');

  // Use the useEffect hook to change the letter at a random time frequency
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate a random letter
      const randomLetter = String.fromCharCode(Math.floor(Math.random() * 255));
      setLetter(randomLetter);
    }, Math.random()*1000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="random-letter">
      {letter}
    </div>
  );
}

export default RandomLetter;
