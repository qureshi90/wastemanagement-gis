import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import WasteManagementMap from "./Components/WasteManagementMap";
import RegisterUser from "./Components/RegisterUser";
import "./App.css";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      exact: true,
      element: <RegisterUser />,
    },
    {
      path: "/map",
      element: <WasteManagementMap />,
    },
  ]);

  return loading ? (
    <div className="w-screen h-screen">
      <img
        src={require("./assets/image.jpeg")}
        className="w-full h-full"
        alt="loading"
      />
      <div className="linear-loader" />
    </div>
  ) : (
    <RouterProvider router={router} />
  );
}

export default App;
