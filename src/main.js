import { createApp, ref } from 'vue'
import App from './App.vue'

//导入路由
import router from './router/index'

//全局导入Element plus
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import axios from 'axios';


const app = createApp(App);

app.use(router);
app.use(ElementPlus);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}


app.provide('detailManageTable', ref(true));


app.mount('#app')


// window.$baseURL = 'http://localhost:8088'
// window.$baseURL = 'http://soms-fastapi-110860-4-1327191391.sh.run.tcloudbase.com/'
window.$baseURL = 'http://114.132.72.61:8088'
window.$axios = axios.create({
    //设置超时时间
    timeout: 8000,
    baseURL: window.$baseURL,
});

