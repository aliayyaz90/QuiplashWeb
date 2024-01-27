import React from "react";
import JoinGame from "./Pages/JoinGame";
import Answer from "./Pages/Answer";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "../src/style/style.css";
import RoundTwoScreen from "./Pages/RoundTwoScreen";
import RoundThreeScreen from "./Pages/RoundThreeScreen";
import CommonQuestions from "./Pages/CommonQuestions";
import Status from "./Pages/Status";
const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<JoinGame />} />
          <Route exact path="answer" element={<Answer />} />
          <Route exact path="/round-two" element={<RoundTwoScreen />} />
          <Route exact path="/round-three" element={<RoundThreeScreen />} />
          <Route exact path="/common-question" element={<CommonQuestions />} />
          <Route exact path="/status" element={<Status />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
