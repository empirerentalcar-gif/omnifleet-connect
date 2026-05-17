import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { setupGlobalClickTracking } from "./lib/analytics";

// Initialize prerenderReady as false; pages set it to true when rendered
window.prerenderReady = false;

// Set up global GA event tracking (CTA clicks, phone, email)
setupGlobalClickTracking();

createRoot(document.getElementById("root")!).render(<App />);
