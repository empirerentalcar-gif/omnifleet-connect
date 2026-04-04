import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import zuvioLogo from "@/assets/zuvio-logo.png";

const Footer = () => {
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
              Connecting renters with trusted independent rental agencies nationwide. Cash-friendly options. Full owner control.
            </p>
            <div className="flex gap-4">
              {[
                { Icon: Facebook, label: "Follow ZUVIO on Facebook" },
                { Icon: Twitter, label: "Follow ZUVIO on Twitter" },
                { Icon: Instagram, label: "Follow ZUVIO on Instagram" },
                { Icon: Linkedin, label: "Follow ZUVIO on LinkedIn" },
              ].map(({ Icon, label }, i) => (
                <a key={i} href="#" aria-label={label} className="w-10 h-10 rounded-xl bg-[#1a2d4a] flex items-center justify-center text-[#8899aa] hover:text-[#2dd4bf] hover:bg-[#1a2d4a]/80 transition-colors">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* For Renters */}
          <div>
            <h3 className="font-display font-bold mb-6 text-white">For Renters</h3>
            <ul className="space-y-3">
              <li><Link to="/search" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">Search Vehicles</Link></li>
              <li><Link to="/cities" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">Browse Cities</Link></li>
              <li><Link to="/las-vegas" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">Las Vegas</Link></li>
              <li><Link to="/how-it-works" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">How It Works</Link></li>
              <li><Link to="/faq" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* For Agencies */}
          <div>
            <h3 className="font-display font-bold mb-6 text-white">For Agencies</h3>
            <ul className="space-y-3">
              <li><Link to="/for-agencies" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">For Agencies</Link></li>
              <li><Link to="/owner-benefits" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">Owner Benefits</Link></li>
              <li><Link to="/pricing" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">Pricing</Link></li>
              <li><Link to="/for-turo-hosts" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">Turo Host?</Link></li>
              <li><Link to="/signup" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">Join Zuvio</Link></li>
              <li><Link to="/signin" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">Owner Sign In</Link></li>
            </ul>
          </div>

          {/* Zuvio */}
          <div>
            <h3 className="font-display font-bold mb-6 text-white">Zuvio</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">About Us</Link></li>
              <li><Link to="/blog" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">Blog</Link></li>
              <li><Link to="/privacy" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-[#2dd4bf] hover:text-[#5eead4] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-bold mb-6 text-white">Contact</h3>
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
        <div className="border-t border-[#1a2d4a] mt-12 pt-8 flex justify-between items-center">
          <p className="text-sm text-[#8899aa]">
            © 2026 Zuvio. All rights reserved.
          </p>
          <Link to="/admin" className="text-sm text-white/40 hover:text-white/60 transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
