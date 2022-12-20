import React from 'react';
import Raindrop from './Rain';

class RainScene extends React.Component {
  renderRaindrops = () => {
    const raindrops = [];

    for (let i = 0; i < 100; i++) {
      raindrops.push(
        <Raindrop
          key={i}
          initialX={Math.random() * window.innerWidth}
          initialY={Math.random() * -window.innerHeight}
          speed={Math.random() * 5 + 5}
        />
      );
    }

    return raindrops;
  }

  render() {
    return (
      <div className="rain-scene">
        {this.renderRaindrops()}
      </div>
    );
  }
}

export default RainScene;