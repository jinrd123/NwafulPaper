import Vue from "vue";
import VueRouter from "vue-router";
import Home from "@/pages/Home";
import Editor from "@/pages/Editor";
import BackGround from "@/pages/BackGround";

Vue.use(VueRouter);

let router = new VueRouter({
    routes: [
        {
            path: "/background",
            component: BackGround
        },
        {
            path: "/home",
            component: Home
        },
        {
            path: "/editor",
            component: Editor
        },
        {
            path: "/",
            redirect: "/editor"
        }
    ]
})

export default router;