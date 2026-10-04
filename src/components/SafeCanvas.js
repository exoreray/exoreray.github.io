import { Component } from 'react';
import { Canvas } from '@react-three/fiber';

// Catches WebGL failures (no GPU support, context creation errors) so a
// single broken 3D scene doesn't blank out the whole page.
class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn('3D scene disabled:', error);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

const SafeCanvas = (props) => (
  <WebGLErrorBoundary>
    <Canvas {...props} />
  </WebGLErrorBoundary>
);

export default SafeCanvas;
