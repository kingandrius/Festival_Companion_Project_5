import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { Feed } from "./components/Feed";
import { Schedule } from "./components/Schedule";
import { Map } from "./components/Map";
import { AIAssistant } from "./components/AIAssistant";
import { Food } from "./components/Food";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Feed },
      { path: "schedule", Component: Schedule },
      { path: "map", Component: Map },
      { path: "food", Component: Food },
      { path: "assistant", Component: AIAssistant },
    ],
  },
]);
