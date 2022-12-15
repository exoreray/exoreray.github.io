// Create your Body component here
import { FaGithub, FaLinkedin } from "react-icons/fa";
import Avatar from '../assets/profile.png';

const Body = () => {
    return (
        <div id="body" className="body">
            <div className="body-container">
                <div className="body-profile">
                    <img className="body-img" alt='avatar' src={Avatar} ></img>
                    <div class="hole"></div>

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
    )
}

export default Body;