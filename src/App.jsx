import './App.css';
import WasteManagementMap from './Components/WasteManagementMap';
import RegisterUser from './Components/RegisterUser';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <RegisterUser />,
    },
    {
      path: '/map',
      element: <WasteManagementMap />,
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
