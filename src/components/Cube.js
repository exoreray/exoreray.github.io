import React, { Component } from "react";
import * as THREE from "three";
class Cube extends Component {
    constructor() {
        super();
        // const roughnessMap = new THREE.TextureLoader().load('roughness.jpg');
        // const metalnessMap = new THREE.TextureLoader().load('metalness.jpg');

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.renderer = new THREE.WebGLRenderer();
        this.geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
        this.material = new THREE.MeshPhysicalMaterial({
            // color: 0xC0C0C0, // light grey color
            // roughness: 0.5,
            // roughnessMap: roughnessMap,
            // metalness: 1, // fully metallic
            // metalnessMap: metalnessMap
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        // Make the object smaller
        this.mesh.scale.set(0.2, 0.2, 0.2);  // Set the scale to be 5 times smaller on all axes
        this.light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);

        const light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(5, 5, 5);
        this.scene.add(light);

        // const light2 = new THREE.DirectionalLight(0xffffff, 1);
        // light2.position.set(5, 5, 5);
        // this.scene.add(light2);
        this.colors = [
            new THREE.Color(0xff0000), // Red
            new THREE.Color(0xffa500), // Orange
            new THREE.Color(0xffff00), // Yellow
            new THREE.Color(0x00ff00), // Green
            new THREE.Color(0x0000ff), // Blue
            new THREE.Color(0x4b0082), // Indigo
            new THREE.Color(0x9400d3), // Violet
        ];

        this.duration = 1; // Interpolate over 5 seconds
        this.startTime = Date.now();


    }

    componentDidMount() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.mount.appendChild(this.renderer.domElement);
        this.scene.add(this.mesh);
        this.scene.add(this.light);
        this.camera.position.z = 2;
        this.animate();
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.mesh.rotation.x += 0.005;
        this.mesh.rotation.y += 0.005;
        this.mesh.rotation.z += 0.005;
        this.renderer.render(this.scene, this.camera);
        // Change the color of the object gradually
        const elapsedTime = (Date.now() - this.startTime) / 1000; // elapsed time in seconds
        const t = elapsedTime / this.duration; // normalized time (0 to 1)
        const index = Math.floor(t); // current color index
        this.material.color.lerp(
            this.colors[(index + 1) % this.colors.length],
            0.01
        ); // Set the color based on the interpolation
    }

    render() {
        return <div className="cube" ref={(ref) => (this.mount = ref)} />;
    }
}

export default Cube;
