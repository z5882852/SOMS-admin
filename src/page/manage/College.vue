<template>
    <div class="console-container card">
        <el-row style="height: 100%;">
            <el-col :span="12" style="height: 100%;">
                <el-select-v2 v-model="searchType" :options="selectType" placeholder="Please select"
                    style="width: 100px" />
                <el-input class="search-input" v-model="search" placeholder="搜索"></el-input>
            </el-col>
            <el-col :span="12" style="height: 100%; text-align: right;">
                <el-button icon="Refresh" style="margin-right: 20px;" @click="fetchData">刷新</el-button>
                <el-button type="primary" icon="Plus" style="margin-right: 20px;" @click="addData">新增学院</el-button>
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
    <el-drawer v-model="drawer.show" :before-close="cancelForm" title="编辑学院信息" direction="rtl" size="500px">
        <div class="edit-drawer__content">
            <el-form ref="baseForm" :model="formData" label-width="auto" :rules="rules">
                <el-form-item label="id">
                    <el-input v-model="formData.id" autocomplete="off" disabled="true" />
                </el-form-item>
                <el-form-item label="学院名" prop="name">
                    <el-input v-model="formData.name" autocomplete="off" />
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
import { computed, ref, h, reactive } from 'vue';
import { ElButton, ElMessage, ElMessageBox } from "element-plus";



export default {
    name: 'College',
    mounted() {
    },
    setup() {
        // 动态信息
        const search = ref('');
        const searchType = ref('name');
        const drawer = reactive({
            show: false,
            loading: false
        })
        const tableLoading = ref(false)
        const tableData = ref([]);
        const formData = reactive({
            id: 'auto',
            name: ''
        })
        const baseForm = ref(null)


        // 定值
        const selectType = [
            {
                value: 'name',
                label: '学院名',
            },
            {
                value: 'id',
                label: 'id',
            }
        ]
        const columns = [
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
                title: '二级学院名',
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
        ];
        const rules = reactive({
            name: [
                { required: true, message: '请填写名称', trigger: 'blur' },
                { min: 1, max: 20, message: '长度不合法', trigger: 'blur' },
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
            formData.id = row.id
            formData.name = row.name
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
                    window.$axios.post("/entity/college/delete", {
                        "college_id": row.id
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
            formData.id = "auto";
            formData.name = ""
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
                    window.$axios.post("/entity/college/add", {
                        "name": formData.name
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
                    window.$axios.post("/entity/college/update", {
                        "college_id": formData.id,
                        "name": formData.name
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
            window.$axios.get("/entity/college/all", {
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


        fetchData();


        return {
            search,
            searchType,
            drawer,
            baseForm,
            tableLoading,
            formData,

            cancelForm,
            selectType,
            filterTableData,
            handleEdit,
            handleDelete,
            updateData,
            fetchData,
            addData,

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
