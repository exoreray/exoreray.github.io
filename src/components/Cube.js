import React, { Component } from "react";
import * as THREE from "three";
class Cube extends Component {
    constructor() {
      super();
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      this.renderer = new THREE.WebGLRenderer();
      this.geometry = new THREE.BoxGeometry(1, 1, 1);
      this.material = new THREE.MeshStandardMaterial({ color: 0x7e31eb });
      this.cube = new THREE.Mesh(this.geometry, this.material);
      this.light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    }
  
    componentDidMount() {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.mount.appendChild(this.renderer.domElement);
      this.scene.add(this.cube);
      this.scene.add(this.light);
      this.camera.position.z = 2;
      this.animate();
    }
  
    animate() {
      requestAnimationFrame(this.animate.bind(this));
      this.cube.rotation.x += 0.01;
      this.cube.rotation.y += 0.01;
      this.cube.rotation.z += 0.01;
      this.renderer.render(this.scene, this.camera);
    }
  
    render() {
      return <div className="cube" ref={(ref) => (this.mount = ref)} />;
    }
  }
  
export default Cube;
