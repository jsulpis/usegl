import DefaultTheme from "vitepress/theme";
import { Sandbox } from "vitepress-plugin-sandpack";
import "vitepress-plugin-sandpack/dist/style.css";
import "virtual:group-icons.css";
import "./styles.scss";

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp(ctx);
    ctx.app.component("Sandbox", Sandbox);
  },
};
