import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found. Make sure index.html has a <div id='root'></div>.");
}

createRoot(rootElement).render(<App />);
