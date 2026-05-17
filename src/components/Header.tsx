import { Menu, X, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useTranslation } from "react-i18next";
import LanguageToggle from "@/components/LanguageToggle";
import zuvioLogo from "@/assets/zuvio-logo.png";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const { t } = useTranslation();

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
              width={160}
              height={56}
              loading="eager"
              decoding="async"
            />
            <span className="hidden sm:block text-[10px] md:text-xs text-muted-foreground font-medium tracking-wide leading-tight border-l border-border/50 pl-3">
              {t("nav.tagline")}
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="/search" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.findRentals")}
            </a>
            <a href="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.howItWorks")}
            </a>
            <a href="/for-agencies" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.forAgencies")}
            </a>
            <a href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.pricing")}
            </a>
            <a href="/faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.faq")}
            </a>
            <a href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.about")}
            </a>
            <a href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.blog")}
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageToggle />
            {!loading && user ? (
              <>
                {isAdmin && (
                  <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
                    <Shield className="h-4 w-4 mr-1" />
                    {t("nav.teamLogin")}
                  </Button>
                )}
                {!isAdmin && (
                  <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                    {t("nav.dashboard")}
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-1" />
                  {t("common.signOut")}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/signin')}>
                  {t("common.signIn")}
                </Button>
                <Button variant="default" size="sm" onClick={() => navigate('/signup')}>
                  {t("common.getStarted")}
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
                {t("nav.findRentals")}
              </a>
              <a href="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t("nav.howItWorks")}
              </a>
              <a href="/for-agencies" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t("nav.forAgencies")}
              </a>
              <a href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t("nav.pricing")}
              </a>
              <a href="/faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t("nav.faq")}
              </a>
              <a href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t("nav.about")}
              </a>
              <a href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t("nav.blog")}
              </a>
              <div className="pt-2"><LanguageToggle /></div>
              <div className="flex gap-3 pt-4 border-t border-border/30">
                {!loading && user ? (
                  <>
                    {isAdmin && (
                      <Button variant="ghost" size="sm" className="flex-1" onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }}>
                        <Shield className="h-4 w-4 mr-1" />
                        {t("nav.teamLogin")}
                      </Button>
                    )}
                    {!isAdmin && (
                      <Button variant="ghost" size="sm" className="flex-1" onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}>
                        {t("nav.dashboard")}
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="flex-1" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-1" />
                      {t("common.signOut")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => { navigate('/signin'); setMobileMenuOpen(false); }}>
                      {t("common.signIn")}
                    </Button>
                    <Button variant="default" size="sm" className="flex-1" onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }}>
                      {t("common.getStarted")}
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
