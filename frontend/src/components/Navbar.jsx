import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Navbar.css";

export default function Navbar() {
  return (
    <div>
      <nav className="navbar navbar-expand-sm bg-body-tertiary" id="navbar">
        <div className="container-fluid main-nav">
          <a className="navbar-brand" href="/">
            Apna Video Call
          </a>
          <div className="collapse navbar-collapse" id="navbarNav">
            <a className="nav-link active" href="/auth">
              Register
            </a>

            <a className="nav-link active" href="/auth">
              LogIn
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
}
