import Footer from "../components/Footer";
import Header from "../components/Header";
import { Outlet, useNavigate } from "react-router";

function MainLayout() {
  const navigate = useNavigate();
  const handleNavigate = (path = "/") => {
    navigate(path);
  };
  return (
    <div>
      <Header onHomeClick={handleNavigate} />
      <Outlet />
      <Footer />
    </div>
  );
}

export default MainLayout;
