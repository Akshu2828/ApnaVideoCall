import axios from "axios";
import httpStatus from "http-status";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../../environment";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: `${server}/api/v1/users`,
});

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const [userData, setUserData] = useState(storedUser || null);
  const authContext = useContext(AuthContext);

  const handleRegister = async (name, username, password) => {
    try {
      let request = await client.post("/register", {
        name: name,
        username: username,
        password: password,
      });

      if (request.status === httpStatus.CREATED) {
        return request.data.message;
      }
    } catch (e) {
      throw e;
    }
  };

  const handleLogin = async (username, password) => {
    try {
      let request = await client.post("/login", {
        username: username,
        password: password,
      });

      if (request.status === httpStatus.OK) {
        const user = {
          username: request.data.username,
          token: request.data.token,
        };

        setUserData(user);
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/home");
      }
    } catch (e) {
      throw e;
    }
  };

  const handleLogout = () => {
    setUserData(null);
    localStorage.removeItem("user");
    navigate("/"); // Redirect to login page after logout
  };
  const addToUserHistory = async (meetingCode) => {
    try {
      let request = await client.post("/add_to_history", {
        token: userData?.token,
        meeting_code: meetingCode,
      });
      return request;
    } catch (e) {
      throw e;
    }
  };

  const getToUserHistory = async () => {
    try {
      let request = await client.get("/get_to_history", {
        params: {
          token: userData?.token,
        },
      });
      return request.data;
    } catch (e) {
      throw e;
    }
  };

  const data = {
    userData,
    setUserData,
    handleLogin,
    handleRegister,
    handleLogout,
    addToUserHistory,
    getToUserHistory,
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
