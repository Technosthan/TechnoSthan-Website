import "./App.css";
import AppRoutes from "./app/AppRoutes";
import SmoothScrollProvider from "./providers/SmoothScrollProvider";
import AppMotionProvider from "./providers/AppMotionProvider";
import GlobalBackdrop from "./components/motion/GlobalBackdrop";
import CustomCursor from "./components/motion/CustomCursor";
import PageLoader from "./components/motion/PageLoader";

function App() {
  return (
    <AppMotionProvider>
      <SmoothScrollProvider>
        <GlobalBackdrop />
        <CustomCursor />
        <PageLoader />
        <AppRoutes />
      </SmoothScrollProvider>
    </AppMotionProvider>
  );
}

export default App;
