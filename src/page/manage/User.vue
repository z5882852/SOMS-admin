<template>
    <div class="console-container card">
        <el-row style="height: 100%;">
            <el-col :span="12" style="height: 100%;">
                <el-select-v2 v-model="searchType" :options="selectType" placeholder="Please select"
                    style="width: 100px" />
                <el-input class="search-input" v-model="search" placeholder="搜索"></el-input>
            </el-col>
            <el-col :span="12" style="height: 100%; text-align: right;">
                <el-switch v-model="detailManageTable" style="margin-right: 20px;" inactive-text="简化列表" />
                <el-button icon="Refresh" style="margin-right: 20px;" @click="fetchData">刷新</el-button>
                <el-tooltip content="暂不支持新增用户" placement="top">
                    <el-button type="primary" icon="Plus" style="margin-right: 20px;" @click="addData"
                        :disabled="true">新增用户</el-button>
                </el-tooltip>
                <el-button type="primary" @click="openExcelDialog">导入</el-button>
            </el-col>
        </el-row>
    </div>
    <div class="table-container card ">
        <el-auto-resizer>
            <template #default="{ height, width }">
                <el-table-v2 v-loading="tableLoading" :columns="columns" :data="filterTableData" :width="width"
                    :height="height" fixed />
            </template>
        </el-auto-resizer>
    </div>
    <el-drawer v-model="drawer.show" :before-close="cancelForm" title="编辑用户信息" direction="rtl" size="500px">
        <div class="edit-drawer__content">
            <el-form ref="baseForm" :model="formData" label-width="auto" :rules="rules">
                <el-form-item label="id">
                    <el-input v-model="formData.user_id" autocomplete="off" :disabled="true" />
                </el-form-item>
                <el-form-item label="昵称" prop="nick_name">
                    <el-input v-model="formData.nick_name" autocomplete="off" />
                </el-form-item>
                <el-form-item label="头像链接" prop="avatar_url">
                    <el-input v-model="formData.avatar_url" autocomplete="off" />
                </el-form-item>
                <el-form-item label="学号" prop="student_id">
                    <el-input v-model="formData.student_id" autocomplete="off" />
                </el-form-item>
                <el-form-item label="用户类型" prop="user_type">
                    <el-select-v2 v-model="formData.user_type" :options="userTypes" placeholder="请选择" />
                </el-form-item>
                <el-form-item label="班级名" prop="class_id">
                    <el-select-v2 v-model="formData.class_id" filterable :options="classData.value" remote
                        :remote-method="fetchSelectData" :loading="classData.loading" placeholder="请选择"
                        @change="changeSelectData">
                        <template #loading>
                            <el-icon>
                                <Loading />
                            </el-icon>
                        </template>
                    </el-select-v2>
                </el-form-item>
                <el-form-item label="专业名">
                    <el-tooltip content="该选项由班级决定，无法修改" placement="top">
                        <el-select-v2 v-model="formData.major_id" filterable :options="majorData" :disabled="true"
                            placeholder="请选择" />
                    </el-tooltip>
                </el-form-item>

                <el-form-item label="二级学院">
                    <el-tooltip content="该选项由专业决定，无法修改" placement="top">
                        <el-select-v2 v-model="formData.college_id" :options="collegeData" :disabled="true"
                            placeholder="请选择" />
                    </el-tooltip>

                </el-form-item>
            </el-form>
            <div class="edit-drawer__footer">
                <el-button @click="cancelForm">取消</el-button>
                <el-button type="primary" :loading="drawer.loading" @click="updateData">
                    {{ drawer.loading ? '提交中' : '提交' }}
                </el-button>
            </div>
        </div>
    </el-drawer>
    <ExcelImportExport ref="excelImportExport" />
</template>

<script>
import { computed, ref, h, reactive, inject } from 'vue';
import { ElButton, ElMessage, ElMessageBox, ElTag } from "element-plus";
import ExcelImportExport from '../../components/ExcelImportExport.vue';


export default {
    name: 'User',
    components: {
        ExcelImportExport
    },
    mounted() {
    },
    setup() {
        // 动态信息
        const search = ref('');
        const searchType = ref('nick_name');
        const detailManageTable = inject('detailManageTable');
        const drawer = reactive({
            show: false,
            loading: false
        })
        const tableLoading = ref(false)
        const tableData = ref([]);
        const majorData = ref([]);
        const classData = reactive({
            value: [],
            loading: false
        })
        const collegeData = ref([])
        const formData = reactive({
            user_id: 'auto',
            nick_name: '',
            avatar_url: '',
            student_id: '',
            user_type: '',
            class_id: '',
            major_id: '',
            college_id: '',
        })
        const baseForm = ref(null)


        // 定值
        const userTypes = [
            {
                value: 'student',
                label: '学生',
                type: 'info',
            }, {
                value: 'teacher',
                label: '教师',
                type: 'primary',
            }, {
                value: 'admin',
                label: '管理员',
                type: 'success',
            }
        ]
        const selectType = [
            {
                value: 'nick_name',
                label: '昵称',
            },
            {
                value: 'student_id',
                label: '学号',
            },
            {
                value: 'class',
                label: '班级',
            }, {
                value: 'major',
                label: '专业',
            }, {
                value: 'college',
                label: '学院',
            },
            {
                value: 'id',
                label: 'id',
            }
        ]
        const columns = ref([
            {
                key: 'user_id',
                dataKey: 'user_id',
                title: 'id',
                align: 'center',
                width: 100
            },
            {
                key: 'nick_name',
                dataKey: 'nick_name',
                title: '昵称',
                width: 150
            },
            {
                key: 'avatar_url',
                dataKey: 'avatar_url',
                title: '头像地址',
                hidden: detailManageTable,
                width: 150
            },
            {
                key: 'student_id',
                dataKey: 'student_id',
                title: '学号',
                width: 150
            },
            {
                key: 'user_type',
                dataKey: 'user_type',
                title: '用户类型',
                width: 100,
                cellRenderer: (data) => {
                    for (let i = 0; i < userTypes.length; i++) {
                        if (userTypes[i].value === data.rowData.user_type) {
                            return h(
                                ElTag,
                                { type: userTypes[i].type },
                                () => userTypes[i].label
                            )
                        }
                    }
                }
            },
            {
                key: 'class_id',
                dataKey: 'class_id',
                title: '班级id',
                hidden: detailManageTable,
                width: 100
            },
            {
                key: 'class',
                dataKey: 'class',
                title: '班级名',
                width: 200
            },
            {
                key: 'major_id',
                dataKey: 'major_id',
                title: '专业id',
                hidden: detailManageTable,
                width: 100
            },
            {
                key: 'major',
                dataKey: 'major',
                title: '专业名',
                width: 200
            },
            {
                key: 'college_id',
                dataKey: 'college_id',
                title: '二级学院id',
                hidden: detailManageTable,
                width: 150
            },
            {
                key: 'college',
                dataKey: 'college',
                title: '二级学院',
                width: 200
            }, {
                key: '操作',
                title: '操作',
                width: 150,
                align: 'center',
                cellRenderer: (data) => (
                    h("div", {}, [
                        h(
                            ElButton,
                            { onClick: () => handleEdit(data.rowIndex, data.rowData), size: "small", type: "primary", icon: "Edit", circle: true },
                        ),
                        h(
                            ElButton,
                            { onClick: () => handleDelete(data.rowIndex, data.rowData), size: "small", type: "danger", icon: "Delete", circle: true, disabled: true }
                        )
                    ])
                ),
            },
        ]);
        const rules = reactive({
            nick_name: [
                { required: true, message: '请填写名称', trigger: 'blur' },
                { min: 1, max: 20, message: '长度不合法', trigger: 'blur' },
            ],
            avatar_url: [
                { required: true, message: '请填写名称', trigger: 'blur' },
                { min: 1, max: 200, message: '长度不合法', trigger: 'blur' },
            ],
            user_type: [
                { required: true, message: '请选择用户类型', trigger: 'blur' },
            ],
            class_id: [
                { required: true, message: '请选择班级', trigger: 'blur' },
            ],
        })


        const cancelForm = (e) => {
            drawer.show = false
            drawer.loading = false
            if (e === true) {
                fetchData()
            }
        }

        const filterTableData = computed(() => {
            return tableData.value.filter(data => {
                return !search.value || (data[searchType.value] + "").toLowerCase().includes(search.value.toLowerCase());
            });
        });

        const handleEdit = (index, row) => {
            fetchSelectData("");
            formData.user_id = row.user_id
            formData.nick_name = row.nick_name
            formData.avatar_url = row.avatar_url;
            formData.student_id = row.student_id;
            formData.user_type = row.user_type;
            formData.class_id = row.class_id;
            formData.major_id = row.major_id;
            formData.college_id = row.college_id
            drawer.show = true;
            console.log("编辑", index, row);
        };

        const handleDelete = (index, row) => {
            ElMessageBox.confirm("是否确认删除？删除该数据可能会导致其他关联数据错误。", "提示", {
                confirmButtonText: "确认",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    console.log("删除", index, row);
                    window.$axios.post("/entity/class/delete", {
                        "class_id": row.id
                    }, {
                        headers: {
                            "Authorization": "Bearer " + localStorage.getItem("access_token")
                        }
                    }).then(response => {
                        if (response.status == 200) {
                            if (response.data.code == 200) {
                                ElMessage({
                                    message: `删除数据成功`,
                                    type: 'success',
                                })
                                fetchData()
                            } else {
                                ElMessage({
                                    message: `删除数据失败，${response.data.message}`,
                                    type: 'error',
                                })
                            }
                        } else {
                            ElMessage({
                                message: `删除数据失败，code: ${response.status}`,
                                type: 'error',
                            })
                        }
                    }).catch(error => {
                        ElMessage({
                            message: `编辑数据失败，请检查网络`,
                            type: 'error',
                        })
                        console.error(error)
                    })
                })
                .catch(() => {
                    //取消：就不做任何提示了
                });

        };

        const addData = () => {
            fetchSelectData("");
            formData.user_id = "auto";
            formData.name = "";
            formData.major_id = "";
            formData.college_id = "";
            drawer.show = true;
        }

        const updateData = () => {
            baseForm.value.validate((valid) => {
                if (!valid) {
                    ElMessage({
                        type: "error",
                        message: "请正确填写表单",
                    });
                    return
                }
                drawer.loading = true;
                if (formData.user_id == 'auto') {
                    ElMessage({
                        message: `暂不支持该功能！`,
                        type: 'error',
                    })
                } else {
                    console.log(formData.class_id)
                    window.$axios.post("/entity/user/update", {
                        "user_id": formData.user_id,
                        "nick_name": formData.nick_name,
                        "avatar_url": formData.avatar_url,
                        "student_id": formData.student_id,
                        "user_type": formData.user_type,
                        "class_id": formData.class_id,
                    }, {
                        headers: {
                            "Authorization": "Bearer " + localStorage.getItem("access_token")
                        }
                    }).then(response => {
                        if (response.status == 200) {
                            if (response.data.code == 200) {
                                cancelForm(true)
                                ElMessage({
                                    message: `编辑数据成功`,
                                    type: 'success',
                                })
                            } else {
                                ElMessage({
                                    message: `编辑数据失败，${response.data.message}`,
                                    type: 'error',
                                })
                            }
                        } else {
                            ElMessage({
                                message: `编辑数据失败，code: ${response.status}`,
                                type: 'error',
                            })
                        }
                        drawer.loading = false;
                    }).catch(error => {
                        ElMessage({
                            message: `编辑数据失败，请检查网络`,
                            type: 'error',
                        })
                        console.error(error)
                        drawer.loading = false
                    })
                }
            })
        }

        const fetchData = () => {
            tableLoading.value = true;
            window.$axios.get("/entity/user/all", {
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("access_token")
                }
            }).then(response => {
                if (response.status == 200) {
                    if (response.data.code == 200) {
                        tableData.value = response.data.data || []
                    } else {
                        ElMessage({
                            message: `获取数据失败，${response.data.message}`,
                            type: 'error',
                        })
                    }
                } else {
                    ElMessage({
                        message: `获取数据失败，code: ${response.status}`,
                        type: 'error',
                    })
                }
                tableLoading.value = false
            }).catch(error => {
                ElMessage({
                    message: `获取数据失败，请检查网络`,
                    type: 'error',
                })
                console.error(error)
                tableLoading.value = false
            })
        }

        const fetchSelectData = (query) => {
            classData.loading = true;
            window.$axios.get("/entity/class/all", {
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("access_token")
                }
            }).then(response => {
                if (response.status == 200) {
                    if (response.data.code == 200) {
                        collegeData.value = response.data.data.map((item) => {
                            return { value: item.college_id, label: item.college }
                        })
                        majorData.value = response.data.data.map((item) => {
                            return { value: item.major_id, label: item.major }
                        })
                        let opt = response.data.data.map((item) => {
                            return { value: item.id, label: item.name, major_id: item.major_id, college_id: item.college_id }
                        })
                        classData.value = opt.filter((item) => {
                            return item.label.toLowerCase().includes(query.toLowerCase())
                        })
                    } else {
                        ElMessage({
                            message: `获取数据失败，${response.data.message}`,
                            type: 'error',
                        })
                    }
                } else {
                    ElMessage({
                        message: `获取数据失败，code: ${response.status}`,
                        type: 'error',
                    })
                }
                classData.loading = false
            }).catch(error => {
                ElMessage({
                    message: `获取数据失败，请检查网络`,
                    type: 'error',
                })
                console.error(error)
                classData.loading = false
            })
        }

        const changeSelectData = (e) => {
            console.log(e, classData)
            for (let i = 0; i < classData.value.length; i++) {
                if (classData.value[i] && classData.value[i].value === e) {
                    formData.major_id = classData.value[i].major_id;
                    formData.college_id = classData.value[i].college_id;
                }
            }
        }


        fetchData();


        return {
            search,
            searchType,
            drawer,
            baseForm,
            tableLoading,
            formData,
            classData,
            majorData,
            collegeData,
            detailManageTable,


            cancelForm,
            selectType,
            filterTableData,
            handleEdit,
            handleDelete,
            updateData,
            fetchData,
            addData,
            fetchSelectData,
            changeSelectData,


            rules,
            userTypes,
            columns,
        };
    },
    methods: {
        handleImportSuccess(importedData) {
            console.log('导入的数据:', importedData);
        },
        openExcelDialog() {
            const fields = [
                { name: "学院", value: "college" },
                { name: "区队", value: "class" },
                { name: "姓名", value: "nick_name" },
                { name: "学号", value: "student_id" },
            ];
            this.$refs.excelImportExport.openDialog(fields, this.handleImportSuccess);
        }
    }
}
</script>
<style scoped>
.console-container {
    width: calc(100% - 20px);
    height: 32px;
    padding: 14px 10px;
    background-color: var(--el-bg-color);
}

.table-container {
    width: 100%;
    height: calc(100% - 75px);
    margin-top: 15px;
    background-color: var(--el-bg-color);
}

.search-input {
    width: 30%;
    margin-left: 10px;
    min-width: 200px;
}

.el-select-type {
    height: 20px;
}

.table-icon {
    width: 20px;
    height: 20px;
    margin: 4px;
    margin-right: 10px;
}

.table-icon-edit {
    color: #1c90cb;
}

.table-icon-edit:hover {
    color: #66ccff;
}

.table-icon-delete {
    color: #d82929;
}

.table-icon-delete:hover {
    color: #ed6f6f;
}

.edit-drawer__footer {
    text-align: right;
}
</style>
<style>
.el-drawer__title {
    font-size: 18px;
}
</style>
