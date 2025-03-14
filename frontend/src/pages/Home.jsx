import { useContext, useState } from "react";
import "../styles/Home.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import withAuth from "../utils/withAuth";
import { AuthContext } from "../contexts/AuthContext";

function Home() {
  const navigate = useNavigate();
  let [meetingCode, setMeetingCode] = useState("");

  const { addToUserHistory, handleLogout } = useContext(AuthContext);

  let handleMeetingCode = async () => {
    await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  };

  return (
    <div>
      <div>
        <nav className="navbar navbar-expand-sm bg-body-tertiary" id="navbar">
          <div className="container-fluid main-nav">
            <a className="navbar-brand" href="/home">
              Apna Video Call
            </a>
            <div id="navbarNav">
              <a
                className="nav-link active"
                aria-current="page"
                href="/history"
              >
                History
              </a>

              <a
                className="nav-link active"
                onClick={handleLogout}
                style={{ cursor: "pointer" }}
              >
                Logout
              </a>
            </div>
          </div>
        </nav>
      </div>
      <div className="main-container">
        <div className="left-panel">
          <div className="col-8">
            <div>
              <h3>Generate Meeting Code</h3>
            </div>
            <input
              type="text"
              className="form-control"
              id="meetingCode"
              placeholder="Type Meeting Code"
              onChange={(e) => setMeetingCode(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              className="btn btn-primary join-btn"
              onClick={handleMeetingCode}
            >
              Join
            </button>
          </div>
        </div>
        <div className="right-panel">
          <picture>
            <source srcSet="small-image2.png" media="(max-width:1150px)" />
            <img src="callImage.png" />
          </picture>
        </div>
      </div>
      <div id="Footer">
        <p>&copy; 2025 ApnaCollege. All rights reserved.</p>
      </div>
    </div>
  );
}

export default withAuth(Home);
