import { UserContext } from "./components/User";
import { useState } from "react";
import Register from "./components/Register";

function App() {
  const [context, setContext] = useState(null);
  return (
    <UserContext.Provider value={[context, setContext]}>
      <Register />
    </UserContext.Provider>
  );
}

export default App;
