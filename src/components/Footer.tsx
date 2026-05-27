import { Facebook, Youtube, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import zuvioLogo from "@/assets/zuvio-logo.png";
import StripeBadge from "./StripeBadge";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-[#1a2d4a]" style={{ backgroundColor: "#0d1b2e" }}>
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand - Left side kept as-is */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center mb-6">
              <img src={zuvioLogo} alt="Zuvio" className="h-12 w-auto object-contain" width={160} height={48} loading="lazy" decoding="async" />
            </Link>
            <p className="text-[#8899aa] mb-6 max-w-sm">
              {t("footer.tagline")}
            </p>
            <div className="flex gap-4">
              {[
                { Icon: Facebook, label: t("footer.followFacebook"), href: "https://www.facebook.com/profile.php?id=61587809278822" },
                { Icon: Youtube, label: t("footer.followYoutube"), href: "https://www.youtube.com/@ZuvioUS" },
              ].map(({ Icon, label, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-xl bg-[#1a2d4a] flex items-center justify-center text-[#8899aa] hover:text-[#2dd4bf] hover:bg-[#1a2d4a]/80 transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* For Renters */}
          <div>
            <h3 className="font-display font-bold mb-6 text-white">{t("footer.forRenters")}</h3>
            <ul className="space-y-3">
              <li><Link to="/search" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">{t("footer.searchVehicles")}</Link></li>
              <li><Link to="/how-it-works" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">{t("footer.howItWorks")}</Link></li>
              <li><Link to="/faq" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">{t("footer.faqs")}</Link></li>
            </ul>
            <h4 className="font-display font-bold mt-6 mb-3 text-white text-sm">{t("footer.browseCities")}</h4>
            <ul className="space-y-3">
              <li><Link to="/las-vegas" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">Las Vegas</Link></li>
              <li><Link to="/phoenix" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">Phoenix</Link></li>
              <li><Link to="/los-angeles" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">Los Angeles</Link></li>
              <li><Link to="/houston" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">Houston</Link></li>
              <li><Link to="/miami" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">Miami</Link></li>
              <li><Link to="/new-york" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">New York</Link></li>
              <li><Link to="/cities" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">{t("footer.allCities")}</Link></li>
            </ul>
          </div>

          {/* For Agencies */}
          <div>
            <h3 className="font-display font-bold mb-6 text-white">{t("footer.forAgencies")}</h3>
            <ul className="space-y-3">
              <li><Link to="/for-agencies" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">{t("footer.forAgencies")}</Link></li>
              <li><Link to="/owner-benefits" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">{t("footer.ownerBenefits")}</Link></li>
              <li><Link to="/pricing" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">{t("footer.pricing")}</Link></li>
              <li><Link to="/for-turo-hosts" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">{t("footer.turoHost")}</Link></li>
              <li><Link to="/signup" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">{t("footer.joinZuvio")}</Link></li>
              <li><Link to="/signin" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">{t("footer.ownerSignIn")}</Link></li>
            </ul>
          </div>

          {/* Zuvio */}
          <div>
            <h3 className="font-display font-bold mb-6 text-white">{t("footer.zuvio")}</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">{t("footer.aboutUs")}</Link></li>
              <li><Link to="/blog" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">{t("footer.blog")}</Link></li>
              <li><Link to="/privacy" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">{t("footer.privacy")}</Link></li>
              <li><Link to="/terms" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">{t("footer.terms")}</Link></li>
              <li><Link to="/cancellation-policy" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">{t("footer.cancellation")}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-bold mb-6 text-white">{t("footer.contact")}</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:team@zuvio.us" className="flex items-center gap-3 text-[#2dd4bf] hover:text-[#5eead4] transition-colors">
                  <Mail className="h-4 w-4" />
                  <span>team@zuvio.us</span>
                </a>
              </li>
              <li>
                <a href="tel:+17252392300" className="flex items-center gap-3 text-[#2dd4bf] hover:text-[#5eead4] transition-colors">
                  <Phone className="h-4 w-4" />
                  <span>(725) 239-2300</span>
                </a>
              </li>
              <li>
                <a href="tel:+17253443074" className="flex items-center gap-3 text-[#2dd4bf] hover:text-[#5eead4] transition-colors">
                  <Phone className="h-4 w-4" />
                  <span>(725) 344-3074</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#1a2d4a] mt-12 pt-8 flex flex-col md:flex-row justify-between md:justify-start items-center gap-4">
          <p className="w-full text-center md:w-auto md:text-left md:mr-auto text-sm text-[#8899aa]">
            {t("footer.copyright")}
          </p>
          <div className="flex items-center gap-4 md:contents">
            <StripeBadge />
            <Link to="/admin" className="text-sm text-white/40 hover:text-white/60 transition-colors">
              {t("footer.teamLogin")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
