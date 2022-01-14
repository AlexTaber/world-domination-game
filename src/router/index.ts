import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../components/Home.vue'
import NewGame from "../components/NewGame.vue";
import Lobby from "../components/Lobby.vue";
import Game from "../components/Game.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },

  {
    name: "New Game",
    path: '/games/new',
    component: NewGame,
  },

  {
    name: "Game",
    path: '/games/:gameId',
    component: Game,
  },

  {
    name: "Lobby",
    path: '/games/:gameId/lobby',
    component: Lobby,
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
