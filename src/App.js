import Header from './components/Header';
import Body from './components/Body';
import About from './components/About';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Footer from './components/Footer';
import Cube from './components/Cube';
// import Raindrop from './components/Rain';
// import RandomLetter from './components/RandomLetter';
import RandomLetterGrid from './components/RandomLetterGrid';
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
        {/* <RandomLetterGrid /> */}

    </div>
    
  );
}

export default App;