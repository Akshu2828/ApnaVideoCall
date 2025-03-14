import "bootstrap/dist/css/bootstrap.min.css";
import { useContext, useState } from "react";
import "../styles/LoginSignPage.css";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginSignPage() {
  const navigate = useNavigate();
  let [name, setName] = useState("");
  let [userName, setUserName] = useState("");
  let [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  let [formState, setFormState] = useState(0);

  const { handleRegister, handleLogin } = useContext(AuthContext);

  let handleAuth = async () => {
    try {
      if (formState === 0) {
        let result = await handleLogin(userName, password);
        setUserName("");
        setMessage(result);
        setError("");
        setPassword("");
      }

      if (formState === 1) {
        let result = await handleRegister(name, userName, password);
        console.log(result);
        setUserName("");
        setMessage(result);
        setError("");
        setFormState(0);
        setPassword("");
      }
    } catch (err) {
      console.log(err);
      let message = err.response.data.message;
      setError(message);
    }
  };

  return (
    <div className="AuthBody">
      <div className="AuthPage">
        <div className="Auth-btns">
          <div className="Auth-btns-buttons">
            <button
              className="btn btn-outline-primary auth-button"
              onClick={() => setFormState(0)}
            >
              LogIn
            </button>
            <button
              className="btn btn-light auth-button"
              onClick={() => setFormState(1)}
            >
              Sign Up
            </button>
          </div>
        </div>
        <div className="Auth-form">
          {formState === 1 ? (
            <div className="mb-3 col-8 offset-2">
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={name}
                placeholder="Enter Your name here"
                required
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          ) : (
            <></>
          )}

          <div className="mb-3 col-8 offset-2">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              value={userName}
              placeholder="Enter Your Username here"
              required
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
          <div className="mb-3 col-8 offset-2">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={password}
              placeholder="Enter Your Password here"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        </div>

        <div className="auth-bottom">
          <button className="btn btn-primary" onClick={handleAuth}>
            {formState === 0 ? "LogIn" : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
