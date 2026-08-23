import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DesktopPetInteractive } from "@/components/PetInteractive";
import { Home } from "@/pages/Home";
import { Showcase } from "@/pages/Showcase";
import { About } from "@/pages/About";
import { Resume } from "@/pages/Resume";
import Life from "@/pages/Life";
import PhotoDetail from "@/pages/PhotoDetail";
import Upload from "@/pages/Upload";
import { Pet } from "@/pages/Pet";
import { Certificates } from "@/pages/Certificates";
import { Teacher } from "@/pages/Teacher";
import { MindMapPage } from "@/pages/MindMapPage";

function AppContent() {
  const location = useLocation();
  const hideGlobalPet = location.pathname === '/pet' || location.pathname === '/teacher';
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/showcase" element={<Showcase />} />
          <Route path="/about" element={<About />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route path="/mindmap" element={<MindMapPage />} />
          <Route path="/life" element={<Life />} />
          <Route path="/photo/:id" element={<PhotoDetail />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/showcase/:project" element={<Showcase />} />
          <Route path="/pet" element={<Pet />} />
        </Routes>
      </main>
      <Footer />
      {!hideGlobalPet && <DesktopPetInteractive />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
