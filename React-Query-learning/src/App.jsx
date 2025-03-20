import PostList from "./components/PostList";
import "./App.css";
import { useState } from "react";

function App() {
  const [toggle, setToggle] = useState(true);
  return (
    <div>
      <h2 className="title">My Posts</h2>
      <button onClick={() => setToggle((prevToggleState) => !prevToggleState)}>
        Toggle
      </button>
      {toggle && <PostList />}
    </div>
  );
}

export default App;
