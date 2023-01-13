// Create your Projects component here
import Project from '../assets/project.png';
import data from '../data/projects.json';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Projects = () => {
    const settings = {
        dots: true,
        infinite: false,
        initialSlide: 0,
        slidesToShow: 3,
        slidesToScroll: 3,
        responsive: [
        {
          breakpoint: 600,
          settings: {
            infinite: false,
            initialSlide: 0,
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    };
    return (
        <div id='projects' className='projects'>
            <div className="heading">
                <h2>WORKS</h2>
            </div>
            <div className="projects-container">
                <Slider {...settings}>
                {
                    data.map((project, key) => {
                        return (
                            <div key={key} className="project">
                                <div className="content">
                                <a
                                        target="_blank"
                                        href={project.link}
                                        rel="noreferrer"
                                        >
                                    <img src={Project} alt="Project" >
                                    </img>
                                    <h2 className="name">{project.name}</h2>
                                    {
                                        project.description.length > 130 
                                        ? <p className='description-min'>{project.description}</p>
                                        :  <p className='description'>{project.description}</p>                                            
                                    }
                                    <div
                                        className="project-button"
                                        rel="noreferrer"
                                        >Detail
                                    </div>
                                </a>
                                </div>
                            </div>
                        )
                    })
                }
                </Slider>
            </div>
        </div>
    )
}

export default Projects;