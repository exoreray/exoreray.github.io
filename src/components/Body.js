import { useEffect, useRef } from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import Avatar from '../assets/profile.png';
import RandomLetterGrid from './RandomLetterGrid';

const Body = () => {
  // Use useRef to store the interval ID
  const intervalId = useRef(0);

  useEffect(() => {
    // Initialize variables and setInterval function
    const hole = document.querySelector('.hole');
    let size = 30;
    let direction = -1;
    intervalId.current = setInterval(() => {
      size += direction;
      if (size <= 10 || size >= 30) {
        direction *= -1;
      }
      hole.style.boxShadow = `0 -5px ${size}px #fff`;
    }, 50);

    // Return a cleanup function to stop the setInterval function
    return () => clearInterval(intervalId.current);
  }, []); // Pass an empty array as the second argument to only run the effect once

  return (
    <div id="body" className="body">
        <div className="random-letter-grid">
        <RandomLetterGrid />
      </div>
      <div className="body-container">
        <div className="body-profile">
          <img className="body-img" alt="avatar" src={Avatar} ></img>
          <div className="hole"></div>

          <div className="body-content">
            <div className="body-headline">Ray Xi</div>
            <div className="body-text">Software Engineer | EECS@Berkeley</div>
          </div>

          <div className="body-icons">
            <a href="https://github.com/exoreray" target="_blank" rel="noreferrer" className="icon-link"><i><FaGithub /></i> </a>
            <a href="https://www.linkedin.com/in/rayxi628/" target="_blank" rel="noreferrer" className="icon-link"><i><FaLinkedin /></i></a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Body;
