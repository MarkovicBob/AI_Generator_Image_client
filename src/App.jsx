import Favorites from "./pages/Favorites";
import Home from "./pages/Home";
import MainLayout from "./Layout/MainLayout";
import NotFound from "./pages/NotFound";
import { Route, Routes } from "react-router";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/favorites" element={<Favorites />} />

          {/* NOT FOUND */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
