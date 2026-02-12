import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize prerenderReady as false; pages set it to true when rendered
window.prerenderReady = false;

createRoot(document.getElementById("root")!).render(<App />);
