import { Link } from "react-router-dom";
import LanguageToggle from "@/components/LanguageToggle";
import zuvioLogo from "@/assets/zuvio-logo.png";

const Header = () => {
  return (
    <div
      className="w-full flex items-center justify-between px-4"
      style={{ backgroundColor: "#0d1b2e", height: "48px" }}
    >
      <Link to="/" className="flex items-center" aria-label="Zuvio Home">
        <img
          src={zuvioLogo}
          alt="Zuvio"
          className="h-7 w-auto object-contain"
        />
      </Link>
      <LanguageToggle />
    </div>
  );
};

export default Header;
