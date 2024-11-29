import { useQuery } from "react-query";

function App() {
  useQuery({
    queryKey: ["posts"],
  });
  return <div>hello world</div>;
}

export default App;
