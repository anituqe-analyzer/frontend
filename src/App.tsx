import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { ExpertTaskDetails } from './pages/ExpertTaskDetails';
import { AddAuction } from './pages/AddAuction';
import { AuctionDetails } from './pages/AuctionDetails';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  const { authModalOpen, openAuthModal, closeAuthModal } = useAuth();

  const handleAuthModalToggle = (nextOpen: boolean) => {
    if (nextOpen) {
      openAuthModal();
    } else {
      closeAuthModal();
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-background font-sans antialiased relative flex flex-col">
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <AuthModal open={authModalOpen} onOpenChange={handleAuthModalToggle} />
        <Navbar />
        <main className="flex-1">
          <ErrorBoundary>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/add-auction" element={<AddAuction />} />
            <Route path="/auction/:id" element={<AuctionDetails />} />
            <Route path="/expert/task/:id" element={<ExpertTaskDetails />} />
            </Routes>
          </ErrorBoundary>
        </main>
        <footer className="border-t py-8 md:py-12 bg-background/50 backdrop-blur-sm">
          <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              &copy; 2025 AntiqueVerify. Wszelkie prawa zastrzeżone.
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Regulamin
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Polityka prywatności
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Kontakt
              </a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
