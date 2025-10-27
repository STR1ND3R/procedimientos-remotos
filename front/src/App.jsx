import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import RemoteProceduresUI from "./RemoteProceduresUI";

function App() {
  const [count, setCount] = useState(0);

  return <RemoteProceduresUI />;
}

export default App;
