// Create your About component here
import IMG from '../assets/profile3.png';

const About = () => {
    return (
        <div id="about" className="about">
            <h1 className="about-heading">About Me</h1>
            <div className="about-info">
                <p className="about-desc"><p>Hey there! I'm a senior at Berkeley, where I'm majoring in EECS because, let's be real, I have no social life. I spend my days tinkering with robots, exploring the depths of computer architecture, and delving into the mysteries of AI (because, let's face it, I'm a huge nerd)</p> <p>In my free time (what little I have), I like to bust out my EDM skills and show off my freestyle dance moves (because, let's be real, I'm the life of the party). I'm always up for a challenge and can't wait to see where my nerdy pursuits take me in the tech world. Here's to a lifetime of nerding out! :)</p></p>
                <div className="about-img">
                    <div className="about-img-wrapper">
                        <img src={IMG} alt="Detective" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default About;