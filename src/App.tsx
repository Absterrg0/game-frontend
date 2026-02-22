import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import UserInformation from "./pages/UserInformation";
import Home from "./pages/Home";
import Callback from "./pages/Callback";
import Settings from "./pages/Settings";
import Tournament from "./pages/Tournament";
import TournamentDetails from "./pages/TournamentDetails";
import MyScore from "./pages/MyScore";
import RecordScore from "./pages/RecordScore";
import Scheduler from "./pages/Scheduler";
import AddScore from "./pages/AddScore";
import ValidateScore from "./pages/ValidateScore";
import Sponsors from "./pages/Sponsors";
import About from "./pages/About";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/user-information" element={<UserInformation />} />
      <Route path="/auth/callback" element={<Callback />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/tournaments" element={<Tournament />} />
      <Route path="/tournaments/:id" element={<TournamentDetails />} />
      <Route path="/record-score" element={<RecordScore />} />
      <Route path="/record-score/add" element={<AddScore />} />
      <Route path="/record-score/validate" element={<ValidateScore />} />
      <Route path="/my-score" element={<MyScore />} />
      <Route path="/scheduler" element={<Scheduler />} />
      <Route path="/sponsors" element={<Sponsors />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
};

export default App;
