import { createApp } from "vue";
import TrainerApp from "./TrainerApp.vue";
import "./studio/studio.css";

const root = document.getElementById("trainer-app");

if (!root) {
  throw new Error("Missing #trainer-app mount point");
}

createApp(TrainerApp).mount(root);
