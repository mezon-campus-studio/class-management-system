import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "@features/auth/pages/LoginPage";
import { RegisterPage } from "@features/auth/pages/RegisterPage";
import App from "@/App";
import { HomePage } from "@features/home/pages/HomePage";
import { ClassDiagram } from "@features/classDiagram/pages/ClassDiagram";
import { LeavePage } from "@features/leave/pages/LeavePage";
import { NotFoundPage } from "@features/error";
import { ClassLayout } from "@shared/components/layout/ClassLayout";
import { Emulation } from "@features/emulation/pages/Emulation"

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
        children: [
          { index: true, element: <ClassDiagram /> },
          { path: "nghiphep", element: <LeavePage /> },
          { path: "thidua", element: <Emulation /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
