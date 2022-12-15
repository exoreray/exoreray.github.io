import Header from './components/Header';
import Body from './components/Body';
import About from './components/About';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Footer from './components/Footer';
// import ThreeScene from './components/3D';
import Cube from './components/Cube';
import './App.css';

const App = () => {
  return (
    <div id="app" className="App">
        <Header />
        <Body />
        <About />
        <Projects />
        <Skills />
        <Footer />
        <Cube/>
        {/* <ThreeScene/> */}
    </div>
  );
}

export default App;