<template>
    <div class="common-layout">
        <el-container class="box">
            <!-- 左侧菜单栏 -->
            <el-aside class="el-aside">
                <h1 class="logoBox">学生成果管理系统后台</h1>
                <el-menu active-text-color="#ffd04b" background-color="#001529" class="el-menu-vertical-demo"
                    default-active="2" text-color="#fff" :router="true">
                    <template v-for="item in asideMenu">
                        <!-- 两级菜单 -->
                        <template v-if="item.subs">
                            <el-sub-menu :index="item.title" :key="item.title">
                                <!-- 一级菜单标题 -->
                                <template #title>
                                    <el-icon>
                                        <document />
                                    </el-icon>
                                    <span>{{ item.title }}</span>
                                </template>
                                <!-- 二级菜单标题 -->
                                <template v-for="subItem in item.subs" :key="subItem.index">
                                    <el-menu-item :index="subItem.index" @click="handleMenuItem(subItem)">{{
                                        subItem.title
                                        }}</el-menu-item>
                                </template>
                            </el-sub-menu>
                        </template>

                        <!-- 一级菜单 -->
                        <template v-else>
                            <el-menu-item :index="item.index" :key="item.title" @click="handleMenuItem(item)">
                                <el-icon>
                                    <document />
                                </el-icon>
                                <span>{{ item.title }}</span>
                            </el-menu-item>
                        </template>
                    </template>
                </el-menu>
            </el-aside>

            <el-container>
                <!-- header头部菜单 -->
                <el-header class="header">
                    <el-menu class="el-menu-demo" mode="horizontal" background-color="#001529" text-color="#fff"
                        active-text-color="#ffd04b">
                        <el-menu-item index="0" class="fr">
                            <span @click.stop="toggleDark()">暗黑模式</span>
                            <el-switch size="small" v-model="isDark" style="margin: 0 5px;" />
                        </el-menu-item>

                        <el-menu-item index="1" class="fr">管理员-1</el-menu-item>
                        <el-sub-menu index="2" class="fr">
                            <template #title class="fr">我的工作台</template>
                            <el-menu-item index="2-1" @click="exitLogin">退出登录</el-menu-item>
                        </el-sub-menu>
                    </el-menu>
                </el-header>

                <!-- 主体模块：标签页 + 当前路由内容 -->
                <el-main class="el-main">
                    <el-tabs type="border-card" v-model="activeTabName" class="demo-tabs" @tab-remove="handleRemove"
                        @tab-click="handleSwitchRoute">
                        <el-tab-pane label="首页" name="home">
                            <keep-alive>
                                <component :is="Home_" />
                            </keep-alive>
                        </el-tab-pane>
                        <el-tab-pane v-for="item in editableTabs" :key="item.index" :label="item.title"
                            :name="item.index" :closable="handleisClose(item)">
                            <keep-alive>
                                <component :is="item.component" />
                            </keep-alive>
                        </el-tab-pane>
                    </el-tabs>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script>
import {
    Document,
    Menu as IconMenu,
    Location,
    Setting,
} from "@element-plus/icons-vue";
import { shallowRef } from "vue";
import { ElMessageBox } from "element-plus";
import { useDark, useToggle } from '@vueuse/core'
import Achievement from './manage/Achievement.vue';
import Class from './manage/Class.vue';
import College from './manage/College.vue';
import Major from './manage/Major.vue';
import User from './manage/User.vue';
import Home from './Main.vue';
import Test from './Test.vue';


export default {
    name: "MainLayout",
    mounted() {
    },
    setup() {
        const isDark = useDark()

        const toggleDark = useToggle(isDark)

        const editableTabs = shallowRef([
            ])

        const Home_ = shallowRef(Home)

        return {
            toggleDark,
            isDark,
            editableTabs,
            Home_
        }
    },
    data() {

        return {
            //当前选项卡
            activeTabName: "home",
            //左侧菜单选项配置
            asideMenu: [
                {
                    title: "首页",
                    index: "home",
                },
                {
                    title: "系统管理",
                    subs: [
                        {
                            title: "成果管理",
                            index: "achievement",
                        },
                        {
                            title: "用户管理",
                            index: "user",
                        },
                        {
                            title: "班级管理",
                            index: "class",
                        },
                        {
                            title: "专业管理",
                            index: "major",
                        },
                        {
                            title: "学院管理",
                            index: "college",
                        },
                    ],
                },
                {
                    title: "测试",
                    index: "test",
                },
            ],
        };
    },
    components: {
        Document,
        IconMenu,
        Location,
        Setting,
    },
    watch: {
    },
    methods: {
        handleisClose(item) {
            return item.index !== "home";
        },
        handleMenuItem(obj) {
            if (obj.index === "home") {
                this.activeTabName = "home";
                this.$router.push("/home");
                return
            }
            this.activeTabName = obj.index;
            let result = this.editableTabs.findIndex((item) => {
                return item.index === obj.index;
            });
            if (result !== -1) {
                return;
            }
            this.editableTabs.push({ ...obj, component: this.getComponent(obj.index) });
        },
        handleSwitchRoute(tabsPaneContext) {
            let tabPaneName = tabsPaneContext.paneName || "home";
            this.$router.push("/" + tabPaneName);
        },
        handleRemove(tabPaneName) {
            let tempArr = this.editableTabs;
            let eleIndex = tempArr.findIndex((item) => {
                return item.index === tabPaneName;
            });
            if (eleIndex === -1) return;

            // 上一个标签页的 index
            let routeIndex = eleIndex > 0 ? tempArr[eleIndex - 1].index : (tempArr[1]?.index || "home");
            let currentTabName = this.activeTabName;

            this.editableTabs.splice(eleIndex, 1);

            // 判断当前标签和将要切换的标签是否相同，如果相同先跳转到临时路由再跳回目标路由
            if (currentTabName === routeIndex) {
                this.$router.push("/redirect").then(() => {
                    this.$router.push("/" + routeIndex);
                });
            } else {
                this.activeTabName = routeIndex;
                this.$router.push("/" + routeIndex);
            }
        },
        exitLogin() {
            ElMessageBox.confirm("真的要退出登陆吗?", "提示", {
                confirmButtonText: "确认",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                localStorage.removeItem("isLogin");
                this.$router.push("/login");
            });
        },
        getComponent(index) {
            switch (index) {
                case 'achievement':
                    return Achievement;
                case 'class':
                    return Class;
                case 'college':
                    return College;
                case 'major':
                    return Major;
                case 'user':
                    return User;
                case 'test':
                    return Test;
                default:
                    return Home;
            }
        }
    }
};
</script>

<style scoped>
.logoBox {
    position: absolute;
    top: 18px;
    left: 30px;
    font-size: 24px;
    color: #fff;
    z-index: 10;
}

.box {
    width: 100vw;
    height: 100vh;
}

.header {
    padding: 0;
    height: 58px;
}

/* 将消息中心和我的控制台摆放在最右侧 */
.el-menu--horizontal {
    justify-content: flex-end;
}

/* 去除默认的边框样式 */
.el-header .el-menu {
    border-bottom: none;
}

.el-aside .el-menu {
    border-right: none;
}


.el-aside {
    width: 200px;
    background: #001529;
    padding-top: 58px;
}

/* 标签页样式 */
/* .demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
} */
.el-tabs--border-card .el-tabs__content {
    padding: 0;
}

.el-tabs--border-card>.el-tabs__content {
    padding: 0px;
}

.el-main .el-tabs__content {
    padding: 0 !important;
}

.demo-tabs>.el-tabs__content {
    background-color: brown;
    padding: 0 !important;
}

.el-tabs {
    height: 100%;
    background: none;
    border: 0;
}
</style>

<style>
.el-tabs--border-card>.el-tabs__content {
    height: calc(100% - 69px);
}

.el-tab-pane {
    height: 100%;
}

.el-menu-item:hover {
    background-color: #0960bd;
}



:root {
    --el-main-color: #e9eef3;
}

html.dark {
    --el-main-color: #01060b;
}

.el-main {
    background-color: var(--el-main-color);
    padding: 0;
}
</style>
