import React from "react";
import { ChatRoom } from "./ChatRoom";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header>
        <h1>AI 대화형 음악 추천</h1>
      </header>
      <section>
        <ChatRoom />
      </section>
    </div>
  );
}

export default App;