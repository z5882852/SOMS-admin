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
                <el-button type="primary" icon="Plus" style="margin-right: 20px;" @click="addData">新增班级</el-button>
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
    <el-drawer v-model="drawer.show" :before-close="cancelForm" title="编辑班级信息" direction="rtl" size="500px">
        <div class="edit-drawer__content">
            <el-form ref="baseForm" :model="formData" label-width="auto" :rules="rules">
                <el-form-item label="id">
                    <el-input v-model="formData.id" autocomplete="off" :disabled="true" />
                </el-form-item>
                <el-form-item label="班级名" prop="name">
                    <el-input v-model="formData.name" autocomplete="off" />
                </el-form-item>
                <el-form-item label="专业名" prop="major_id">
                    <el-select-v2 v-model="formData.major_id" filterable :options="majorData.value" remote
                        :remote-method="fetchSelectData" :loading="majorData.loading" placeholder="请选择"
                        @change="changeSelectData">
                        <template #loading>
                            <el-icon>
                                <Loading />
                            </el-icon>
                        </template>
                    </el-select-v2>
                </el-form-item>

                <el-form-item label="二级学院">
                    <el-tooltip content="该选项由专业决定，无法修改" placement="top">
                        <el-select-v2 v-model="formData.college_id" :options="collegeData" :disabled="true"
                            placeholder="请选择">
                        </el-select-v2>
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
</template>

<script>
import { computed, ref, h, reactive, inject } from 'vue';
import { ElButton, ElMessage, ElMessageBox } from "element-plus";



export default {
    name: 'Class',
    mounted() {
    },
    setup() {
        // 动态信息
        const search = ref('');
        const searchType = ref('name');
        const detailManageTable = inject('detailManageTable');
        const drawer = reactive({
            show: false,
            loading: false
        })
        const tableLoading = ref(false)
        const tableData = ref([]);
        const majorData = reactive({
            value: [],
            loading: false
        })
        const collegeData = ref([])
        const formData = reactive({
            id: 'auto',
            name: '',
            major_id: '',
            college_id: '',
        })
        const baseForm = ref(null)


        // 定值
        const selectType = [
            {
                value: 'name',
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
                key: 'id',
                dataKey: 'id',
                title: 'id',
                align: 'center',
                width: 150
            },
            {
                key: 'name',
                dataKey: 'name',
                title: '班级名',
                width: 250
            },
            {
                key: 'major_id',
                dataKey: 'major_id',
                title: '专业id',
                hidden: detailManageTable,
                width: 150
            },
            {
                key: 'major',
                dataKey: 'major',
                title: '专业名',
                width: 250
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
                            { onClick: () => handleDelete(data.rowIndex, data.rowData), size: "small", type: "danger", icon: "Delete", circle: true }
                        )
                    ])
                ),
            },
        ]);
        const rules = reactive({
            name: [
                { required: true, message: '请填写名称', trigger: 'blur' },
                { min: 1, max: 20, message: '长度不合法', trigger: 'blur' },
            ],
            major_id: [
                { required: true, message: '请选择专业', trigger: 'blur' },
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
            formData.id = row.id
            formData.name = row.name
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
            formData.id = "auto";
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
                if (formData.id == 'auto') {
                    // 新增
                    window.$axios.post("/entity/class/add", {
                        "name": formData.name,
                        "major_id": formData.major_id,
                    }, {
                        headers: {
                            "Authorization": "Bearer " + localStorage.getItem("access_token")
                        }
                    }).then(response => {
                        if (response.status == 200) {
                            if (response.data.code == 200) {
                                cancelForm(true)
                                ElMessage({
                                    message: `新增数据成功`,
                                    type: 'success',
                                })
                            } else {
                                ElMessage({
                                    message: `新增数据失败，${response.data.message}`,
                                    type: 'error',
                                })
                            }
                        } else {
                            ElMessage({
                                message: `新增数据失败，code: ${response.status}`,
                                type: 'error',
                            })
                        }
                        drawer.loading = false;
                    }).catch(error => {
                        ElMessage({
                            message: `新增数据失败，请检查网络`,
                            type: 'error',
                        })
                        console.error(error)
                        drawer.loading = false
                    })
                } else {
                    window.$axios.post("/entity/class/update", {
                        "class_id": formData.id,
                        "name": formData.name,
                        "major_id": formData.major_id,
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
            window.$axios.get("/entity/class/all", {
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
            majorData.loading = true;
            window.$axios.get("/entity/major/all", {
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("access_token")
                }
            }).then(response => {
                if (response.status == 200) {
                    if (response.data.code == 200) {
                        collegeData.value = response.data.data.map((item) => {
                            return { value: item.college_id, label: item.college }
                        })
                        let opt = response.data.data.map((item) => {
                            return { value: item.id, label: item.name, college_id: item.college_id }
                        })
                        majorData.value = opt.filter((item) => {
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
                majorData.loading = false
            }).catch(error => {
                ElMessage({
                    message: `获取数据失败，请检查网络`,
                    type: 'error',
                })
                console.error(error)
                majorData.loading = false
            })
        }

        const changeSelectData = (e) => {
            for (let i=0; i < majorData.value.length; i++) {
                if (majorData.value[i] && majorData.value[i].value === e) {
                    formData.college_id = majorData.value[i].college_id;
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
            columns
        };
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
