import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function History() {
  const { getToUserHistory } = useContext(AuthContext);

  let [meetings, setMeetings] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getToUserHistory();
        setMeetings(history);
      } catch (e) {
        console.log(e);
      }
    };
    fetchHistory();
  }, []);

  let formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };
  return (
    <div>
      <div>
        <nav className="navbar bg-body-tertiary" id="navbar">
          <div className="container-fluid main-nav">
            <a className="navbar-brand" href="/home">
              Apna Video Call
            </a>
            <div id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <a
                    className="nav-link active"
                    onClick={() => {
                      localStorage.removeItem("token");
                      navigate("/");
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    Logout
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
      {meetings.map((e, i) => {
        return (
          <div className="card" key={i}>
            <div className="card-body">
              <h5 className="card-title">Meeting Code: {e.meetingCode}</h5>
              <p className="card-text">Date: {formatDate(e.date)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
