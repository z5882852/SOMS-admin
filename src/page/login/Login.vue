<template>
    <el-main class="login-container card" v-loading="loading">
        <h1 class="login-title">学生成果管理系统后台</h1>
        <el-form :model="form" label-width="auto" style="max-width: 600px">
            <el-space fill>
                <el-alert type="info" show-icon :closable="false">
                    <p>当前为测试环境，暂不支持用户名登录，请使用token登录</p>
                </el-alert>
                <el-form-item label="token">
                    <el-input v-model="form.token" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="this.setToken" class="btn">提交</el-button>
                </el-form-item>
            </el-space>
        </el-form>
    </el-main>
</template>

<script>
import { useRouter } from "vue-router";
import { useDark, useToggle } from '@vueuse/core'
import { ElMessage } from "element-plus";
const $router = useRouter();


export default {
    name: 'Login',
    data() {
        return {
            loading: false,
            form: {
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwib3BlbmlkIjoib1pid1g3Y1p1bkZkbDVQc25aM3FCbklhUlRVRSIsImV4cCI6MTcyMzgyNzU0OX0.I6dpdVQx4HZO1uz9p7xJ9xYqZmY3QADb232uLlW5Opo",
            }
        }
    },
    mounted() {

    },
    methods: {
        setFlag() {
            localStorage.setItem("isLogin", 1);
            this.$router.replace("./");
        },
        setToken() {
            if (!this.form.token || this.form.token === '') {
                ElMessage({
                    message: `请输入token`,
                    type: 'error',
                })
                return
            }
            this.loading = true;
            window.$axios.get("/user/token", {
                headers: {
                    "Authorization": "Bearer " + this.form.token
                }
            }).then(response => {
                if (response.status == 200) {
                    if (response.data.code == 200) {
                        ElMessage({
                            message: `token验证成功`,
                            type: 'success',
                        })
                        localStorage.setItem("access_token", this.form.token);
                        this.setFlag();
                    } else {
                        ElMessage({
                            message: `token验证失败，${response.data.message}`,
                            type: 'error',
                        })
                    }
                } else {
                    ElMessage({
                        message: `token验证失败，: ${response.status}`,
                        type: 'error',
                    })
                }
                this.loading = false;
            }).catch(error => {
                this.loading = false;
                if (error.response && error.response.status === 401) {
                    ElMessage({
                        message: `token验证失败，请检查token是否正确`,
                        type: 'error',
                    })
                } else {
                    ElMessage({
                        message: `token验证失败，请检查网络`,
                        type: 'error',
                    })
                }
                console.error(error)
            })

        }
    },
    setup() {
        const isDark = useDark()
        const toggleDark = useToggle(isDark)
    }
}
</script>

<style scoped>
.login-title {
    text-align: center;
    display: block;
    font-size: 32px;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
    unicode-bidi: isolate;
    margin-bottom: 50px;
}

.login-container {
    padding: 100px;
    padding-top: 50px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.card {
    /* 添加阴影以创建 "card" 效果 */
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
    transition: 0.3s;
}

/* 鼠标悬停时，添加更深的阴影 */
.card:hover {
    box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
}

.btn {
    margin: 0 auto;
}
</style>
