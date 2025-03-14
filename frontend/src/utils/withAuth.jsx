import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function withAuth(WrappedCommponent) {
  const AuthComponent = (props) => {
    const navigate = useNavigate();

    const isAuthenticated = () => {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.token ? true : false;
    };

    useEffect(() => {
      if (!isAuthenticated()) {
        navigate("/auth", { replace: true });
      }
    }, [navigate]);

    return isAuthenticated() ? <WrappedCommponent {...props} /> : null;
  };

  return AuthComponent;
}
