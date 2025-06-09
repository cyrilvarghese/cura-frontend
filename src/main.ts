import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
//Import Mixpanel SDK
import mixpanel from "mixpanel-browser";
const app = mount(App, {
  target: document.getElementById('app')!,
})

mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN || "f20f337a9cafe4028d33ab25db4d825f", {
  debug: true,
  track_pageview: true,
  persistence: "localStorage",
})
export default app
