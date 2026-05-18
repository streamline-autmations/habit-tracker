import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AppDataProvider } from "@/state/AppData";
import Background from "@/components/Background";
import BottomNav from "@/components/BottomNav";
import PageTransition from "@/components/PageTransition";
import Dashboard from "@/pages/Dashboard";
import SOS from "@/pages/SOS";
import Progress from "@/pages/Progress";
import Journal from "@/pages/Journal";
import Settings from "@/pages/Settings";

function Shell() {
  const location = useLocation();
  const isSOS = location.pathname === "/sos";
  return (
    <>
      <Background dotGrid={!isSOS} />
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
        <main className={isSOS ? "flex-1" : "safe-top flex-1 px-4 pb-28 pt-4"}>
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
      {!isSOS && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <AppDataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Shell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sos" element={<SOS />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppDataProvider>
  );
}
