import { Outlet } from "react-router-dom";
import MainLayout from "../shared/layouts/MainLayout";

function App() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

export default App;
