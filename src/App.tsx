import "./App.css";
import { TabsDemo } from "@/components/custom/form";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen">
        <TabsDemo></TabsDemo>
        <Toaster />
      </div>
    </>
  );
}

export default App;
