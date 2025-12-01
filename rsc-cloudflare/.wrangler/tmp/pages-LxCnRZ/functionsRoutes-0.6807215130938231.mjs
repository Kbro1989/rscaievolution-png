import { onRequestGet as __api_player_debug_js_onRequestGet } from "C:\\Users\\Destiny\\Desktop\\ai-architect-mmorpg\\copy-of-rsc-evolution-ai\\rsc-cloudflare\\functions\\api\\player\\debug.js"
import { onRequestGet as __api_player_load_js_onRequestGet } from "C:\\Users\\Destiny\\Desktop\\ai-architect-mmorpg\\copy-of-rsc-evolution-ai\\rsc-cloudflare\\functions\\api\\player\\load.js"
import { onRequestPost as __api_player_login_js_onRequestPost } from "C:\\Users\\Destiny\\Desktop\\ai-architect-mmorpg\\copy-of-rsc-evolution-ai\\rsc-cloudflare\\functions\\api\\player\\login.js"
import { onRequestPost as __api_player_register_js_onRequestPost } from "C:\\Users\\Destiny\\Desktop\\ai-architect-mmorpg\\copy-of-rsc-evolution-ai\\rsc-cloudflare\\functions\\api\\player\\register.js"
import { onRequestPost as __api_player_save_js_onRequestPost } from "C:\\Users\\Destiny\\Desktop\\ai-architect-mmorpg\\copy-of-rsc-evolution-ai\\rsc-cloudflare\\functions\\api\\player\\save.js"
import { onRequestGet as __api_kv_test_js_onRequestGet } from "C:\\Users\\Destiny\\Desktop\\ai-architect-mmorpg\\copy-of-rsc-evolution-ai\\rsc-cloudflare\\functions\\api\\kv-test.js"

export const routes = [
    {
      routePath: "/api/player/debug",
      mountPath: "/api/player",
      method: "GET",
      middlewares: [],
      modules: [__api_player_debug_js_onRequestGet],
    },
  {
      routePath: "/api/player/load",
      mountPath: "/api/player",
      method: "GET",
      middlewares: [],
      modules: [__api_player_load_js_onRequestGet],
    },
  {
      routePath: "/api/player/login",
      mountPath: "/api/player",
      method: "POST",
      middlewares: [],
      modules: [__api_player_login_js_onRequestPost],
    },
  {
      routePath: "/api/player/register",
      mountPath: "/api/player",
      method: "POST",
      middlewares: [],
      modules: [__api_player_register_js_onRequestPost],
    },
  {
      routePath: "/api/player/save",
      mountPath: "/api/player",
      method: "POST",
      middlewares: [],
      modules: [__api_player_save_js_onRequestPost],
    },
  {
      routePath: "/api/kv-test",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_kv_test_js_onRequestGet],
    },
  ]