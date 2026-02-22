import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import "./i18n";
import { UserProvider } from "./context/UserContext";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <UserProvider>
    <Router>
      <App />
    </Router>
  </UserProvider>
);
