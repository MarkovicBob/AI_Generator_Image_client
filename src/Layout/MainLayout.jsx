import Footer from "../components/Footer";
import Header from "../components/Header";
import { Outlet } from "react-router";

function MainLayout() {
  return (
    <div>
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}

export default MainLayout;
