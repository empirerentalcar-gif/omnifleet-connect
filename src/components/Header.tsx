import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import zuvioLogo from "@/assets/zuvio-logo.png";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <img 
              src={zuvioLogo} 
              alt="Zuvio" 
              className="h-12 md:h-14 w-auto object-contain"
            />
            <span className="hidden sm:block text-[10px] md:text-xs text-muted-foreground font-medium tracking-wide leading-tight border-l border-border/50 pl-3">
              Independent Rentals.<br />One Network.
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="/search" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Find Rentals
            </a>
            <a href="/search" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Locations
            </a>
            <a href="/owner-benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              For Agencies
            </a>
            <a href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/signin')}>
                  Sign In
                </Button>
                <Button variant="default" size="sm" onClick={() => navigate('/signup')}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/30">
            <nav className="flex flex-col gap-4">
              <a href="/search" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Find Rentals
              </a>
              <a href="/search" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Locations
              </a>
              <a href="/owner-benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                For Agencies
              </a>
              <a href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
              <div className="flex gap-3 pt-4 border-t border-border/30">
                {!loading && user ? (
                  <>
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}>
                      Dashboard
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-1" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => { navigate('/signin'); setMobileMenuOpen(false); }}>
                      Sign In
                    </Button>
                    <Button variant="default" size="sm" className="flex-1" onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }}>
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
