import LanguageToggle from "@/components/LanguageToggle";

const Header = () => {
  return (
    <div
      className="w-full flex items-center justify-end px-4"
      style={{ backgroundColor: "#0d1b2e", height: "48px" }}
    >
      <LanguageToggle />
    </div>
  );
};

export default Header;
