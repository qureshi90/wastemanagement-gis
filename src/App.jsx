import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import WasteManagementMap from "./Components/WasteManagementMap";
import RegisterUser from "./Components/RegisterUser";
import "./App.css";

const LoadingWrapper = (props) => (
  <>
    {props.loading ? (
      <div className="w-screen h-screen">
        <img
          src={require("./assets/image.jpeg")}
          className="w-full h-full"
          alt="loading"
        />
        <div className="linear-loader" />
      </div>
    ) : (
      props.children
    )}
  </>
);

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
      element: (
        <LoadingWrapper loading={loading}>
          <RegisterUser />
        </LoadingWrapper>
      ),
    },
    {
      path: "/map",
      element: (
        <LoadingWrapper loading={loading}>
          <WasteManagementMap />
        </LoadingWrapper>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
