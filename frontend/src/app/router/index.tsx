import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "@features/auth/pages/LoginPage";
import App from "@/App";
import { HomePage } from "@features/home/pages/HomePage";
import { ClassDiagram } from "@features/classDiagram/pages/ClassDiagram";
import { ClassLayout } from "@shared/components/layout/ClassLayout";

/**
 * Global application router configuration using React Router
 */
export const router = createBrowserRouter([
  // {
  //   path: '/',
  //   element: <LoginPage />, // Temporary root page
  // },
  {
    path: "/auth/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "class/:classId",
        element: <ClassLayout />,
        children: [{ index: true, element: <ClassDiagram /> }],
      },
    ],
  },
]);
