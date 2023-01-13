import Header from './components/Header';
import Body from './components/Body';
import About from './components/About';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Footer from './components/Footer';
import Cube from './components/Cube';
import LoginPage from './components/LoginPage';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
const App = () => {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<><Header/><Body /><About /><Projects/><Skills/><Footer/><Cube/></>}/>
      <Route path="/login" element={<LoginPage />}/>
    </Routes>
  </BrowserRouter>
  );
}

export default App;