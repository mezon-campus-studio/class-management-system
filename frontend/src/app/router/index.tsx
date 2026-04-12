import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "@features/auth/pages/LoginPage";
import { RegisterPage } from "@features/auth/pages/RegisterPage";
import App from "@/App";
import { HomePage } from "@features/home/pages/HomePage";
import { ClassDiagram } from "@features/classDiagram/pages/ClassDiagram";
import { ClassLayout } from "@shared/components/layout/ClassLayout";

/**
 * Global application router configuration using React Router
 */
export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
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
