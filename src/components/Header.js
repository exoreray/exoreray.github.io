// Create your Header component here
const Header = () => {
    return (
        <div className="header">
                <a href="#app"><div className="header-logo">
                    <h3 className="header-name">Ray Xi</h3>
                </div></a>
                <div className="header-container">
                    <div className="nav-item"><a href="/register">register</a></div>
                    <div className="nav-item"><a href="/login">login</a></div>
                    <div className="nav-item"><a href="#about">About</a></div>
                    <div className="nav-item"><a href="#projects">Projects</a></div>
                    <div className="nav-item"><a href="#skills">Skills</a></div>
                </div>
        </div>
    )
}

export default Header;