import { createApp } from "vue";
import StudioShell from "./studio/components/StudioShell.vue";
import "./studio/studio.css";

const root = document.getElementById("trainer-app");

if (!root) {
  throw new Error("Missing #trainer-app mount point");
}

createApp(StudioShell).mount(root);
