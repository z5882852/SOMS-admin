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
                <el-button type="primary" icon="Plus" style="margin-right: 20px;" @click="addData">新增表单</el-button>
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
    <el-drawer v-model="drawer.show" :before-close="cancelForm" title="编辑成果表信息" direction="rtl" size="400px">
        <div class="edit-drawer__content">
            <el-form ref="baseForm" :model="formData" label-width="auto" :rules="rules">
                <el-form-item label="id">
                    <el-input v-model="formData.id" disabled="true" />
                </el-form-item>
                <el-form-item label="标题" prop="title">
                    <el-input v-model="formData.title" />
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input v-model="formData.description" type="textarea" rows="4" />
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
    <el-drawer v-model="achievementRules.show" title="编辑成果表规则" direction="ltr" size="100%">
        <el-row :gutter="20" style="height: 100%;">
            <el-col :span="14">
                <div class="rules-table-container">
                    <el-auto-resizer>
                        <template #default="{ height, width }">
                            <el-table-v2 v-loading="achievementRules.loading" :columns="rulescColumns"
                                :estimated-row-height="60" row-class="rules-table-row" :data="filterRuleTableData"
                                :width="width" :height="height" fixed />
                        </template>
                    </el-auto-resizer>
                </div>
            </el-col>
            <el-col :span="10">
                <div class="console-container card">
                    <el-row style="height: 100%;">
                        <el-col :span="14" style="height: 100%;">

                            <el-input style="width: 100%;" v-model="searchRule" placeholder="搜索">
                                <template #prepend>
                                    <el-select-v2 v-model="searchRuleType" :options="selectRuleType"
                                        placeholder="Please select" style="width: 110px" />
                                </template>
                            </el-input>
                        </el-col>
                        <el-col :span="10" style="height: 100%; text-align: right;">
                            <el-button icon="Refresh" style="margin-right: 10px;" @click="fetchRulesData">刷新</el-button>
                            <el-button type="primary" icon="Plus" style="margin-right: 10px;"
                                @click="addRule">新增</el-button>
                        </el-col>
                    </el-row>
                </div>
                <el-divider />
                <el-form ref="ruleBaseForm" :model="ruleFormData" label-width="auto" :rules="ruleFormRules"
                    :disabled="!achievementRules.editing">
                    <el-form-item label="id">
                        <el-input v-model="ruleFormData.id" :disabled="true" />
                    </el-form-item>
                    <el-form-item label="一级科目" prop="primary_subject">
                        <el-input v-model="ruleFormData.primary_subject" />
                    </el-form-item>
                    <el-form-item label="二级科目" prop="secondary_subject">
                        <el-input v-model="ruleFormData.secondary_subject" type="textarea" rows="2" />
                    </el-form-item>
                    <el-form-item label="三级科目" prop="tertiary_subject">
                        <el-input v-model="ruleFormData.tertiary_subject" type="textarea" rows="2" />
                    </el-form-item>
                    <el-form-item label="级别" prop="level">
                        <el-select-v2 v-model="ruleFormData.level" :options="levelData" placeholder="请选择" />
                    </el-form-item>
                    <el-form-item label="文字信息" prop="text_info">
                        <el-switch v-model="ruleFormData.text_info" inline-prompt active-text="是" inactive-text="否" />
                    </el-form-item>
                    <el-form-item label="证明材料" prop="requires_file">
                        <el-switch v-model="ruleFormData.requires_file" inline-prompt active-text="是"
                            inactive-text="否" />
                    </el-form-item>
                    <el-form-item label="分数" prop="score">
                        <el-input v-model="ruleFormData.score" type="number" />
                    </el-form-item>
                    <div style="width: 100%;text-align: center;">
                        <el-button-group>
                            <el-button @click="cancelRuleForm">取消</el-button>
                            <el-button type="primary" :loading="achievementRules.uploading" @click="updateRule">
                                {{ achievementRules.uploading ? '提交中' : '提交' }}
                            </el-button>
                        </el-button-group>
                    </div>
                </el-form>
            </el-col>
        </el-row>
    </el-drawer>

</template>

<script>
import { computed, ref, h, reactive } from 'vue';
import { ElButton, ElMessage, ElMessageBox, ElTooltip, TableV2FixedDir } from "element-plus";
import { CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue'


export default {
    name: 'Achievement',
    mounted() {
    },
    setup() {
        // 动态信息
        const search = ref('');
        const searchRule = ref('');
        const searchType = ref('title');
        const searchRuleType = ref('tertiary_subject');
        const drawer = reactive({
            show: false,
            loading: false
        })
        const achievementRules = reactive({
            value: [
                {
                    id: 1,
                    primary_subject: "123",
                    secondary_subject: "1234",
                    tertiary_subject: "1234",
                }
            ],
            show: false,
            loading: false,
            achievementId: 0,
            editing: false,
            uploading: false,
        })
        const tableLoading = ref(false)
        const tableData = ref([]);
        const formData = reactive({
            id: 'auto',
            title: '',
            description: '',
        })
        const baseForm = ref(null)
        const ruleFormData = reactive({
            id: 'auto',
            achievement_id: 0,
            primary_subject: '',
            secondary_subject: '',
            tertiary_subject: '',
            level: '其他',
            text_info: true,
            requires_file: true,
            score: 0,
        })
        const ruleBaseForm = ref(null)


        // 定值
        const selectType = [
            {
                value: 'title',
                label: '标题',
            }, {
                value: 'description',
                label: '描述',
            },
            {
                value: 'id',
                label: 'id',
            }
        ]
        const selectRuleType = [
            {
                value: 'tertiary_subject',
                label: '三级科目',
            }, {
                value: 'secondary_subject',
                label: '二级科目',
            }, {
                value: 'primary_subject',
                label: '一级科目',
            }, {
                value: 'level',
                label: '级别',
            }, {
                value: 'score',
                label: '分数',
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
                key: 'title',
                dataKey: 'title',
                title: '标题',
                width: 200
            },
            {
                key: 'description',
                dataKey: 'description',
                title: '描述',
                width: 250,
                cellRenderer: (data) => h(
                    ElTooltip, {
                    content: data.rowData.description,
                    placement: "bottom-start"
                },
                    () => {
                        let desc = data.rowData.description
                        if (desc.length > 15) {
                            desc = desc.substring(0, 15) + "..."
                        }
                        return desc
                    }
                )
            },
            {
                key: 'submitted_num',
                dataKey: 'submitted_num',
                align: 'center',
                title: '提交数量',
                width: 100
            },
            {
                key: 'pending_num',
                dataKey: 'pending_num',
                align: 'center',
                title: '待审核',
                width: 100
            },
            {
                key: 'approved_num',
                dataKey: 'approved_num',
                align: 'center',
                title: '通过',
                width: 100
            },
            {
                key: 'rejected_num',
                dataKey: 'rejected_num',
                align: 'center',
                title: '驳回',
                width: 100
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
                            { onClick: () => handleEditRules(data.rowIndex, data.rowData), size: "small", icon: "List", circle: true },
                        ),
                        h(
                            ElButton,
                            { onClick: () => handleDelete(data.rowIndex, data.rowData), size: "small", type: "danger", icon: "Delete", circle: true }
                        )
                    ])
                ),
            },
        ];
        const rulescColumns = [
            {
                key: 'id',
                dataKey: 'id',
                title: '规则id',
                align: 'center',
                width: 100
            },
            {
                key: 'primary_subject',
                dataKey: 'primary_subject',
                title: '一级科目',
                width: 150
            },
            {
                key: 'secondary_subject',
                dataKey: 'secondary_subject',
                title: '二级科目',
                width: 150
            },
            {
                key: 'tertiary_subject',
                dataKey: 'tertiary_subject',
                title: '三级科目',
                width: 200
            },
            {
                key: 'level',
                dataKey: 'level',
                title: '级别',
                width: 100,
                align: 'center',
            },
            {
                key: 'text_info',
                dataKey: 'text_info',
                title: '文字信息',
                width: 50,
                align: 'center',
                cellRenderer: (data) => h(
                    data.rowData.text_info ? CircleCheckFilled : CircleCloseFilled, {
                    style: "width: 22px; height: 22px;", color: data.rowData.text_info ? "#67C23A" : "#F56C6C"
                })
            },
            {
                key: 'requires_file',
                dataKey: 'requires_file',
                title: '证明材料',
                width: 50,
                align: 'center',
                cellRenderer: (data) => h(
                    data.rowData.requires_file ? CircleCheckFilled : CircleCloseFilled, {
                    style: "width: 22px; height: 22px;", color: data.rowData.requires_file ? "#67C23A" : "#F56C6C"
                })
            },
            {
                key: 'score',
                dataKey: 'score',
                title: '分数',
                align: 'center',
                width: 50
            }, {
                key: '操作',
                title: '操作',
                width: 100,
                fixed: TableV2FixedDir.RIGHT,
                align: 'center',
                cellRenderer: (data) => (
                    h("div", {}, [
                        h(
                            ElButton,
                            { onClick: () => editRule(data.rowIndex, data.rowData), size: "small", type: "primary", icon: "Edit", circle: true },
                        ),
                        h(
                            ElButton,
                            { onClick: () => deleteRule(data.rowIndex, data.rowData), size: "small", type: "danger", icon: "Delete", circle: true }
                        )
                    ])
                ),
            },
        ]
        const rules = reactive({
            title: [
                { required: true, message: '请填写标题', trigger: 'blur' },
                { min: 1, max: 60, message: '长度不合法', trigger: 'blur' },
            ],
            description: [
                { required: true, message: '请填写描述', trigger: 'blur' },
                { min: 1, message: '长度不合法', trigger: 'blur' },
            ],
        })
        const ruleFormRules = reactive({
            primary_subject: [
                { required: true, message: '请填写一级科目', trigger: 'blur' },
            ],
            secondary_subject: [
                { required: true, message: '请填写二级科目', trigger: 'blur' },
            ],
            tertiary_subject: [
                { required: true, message: '请填写三级科目', trigger: 'blur' },
            ],
            level: [
                { required: true, message: '请选择级别', trigger: 'blur' },
            ],
            score: [
                { required: true, message: '请填写分数', trigger: 'blur' },
            ],
        })
        const levelData = [
            { value: "其他", label: "其他" },
            { value: "院系级", label: "院系级" },
            { value: "校级", label: "校级" },
            { value: "市级", label: "市级" },
            { value: "省级", label: "省级" },
            { value: "国家级", label: "国家级" },
        ]


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
        const filterRuleTableData = computed(() => {
            return achievementRules.value.filter(data => {
                return !searchRule.value || (data[searchRuleType.value] + "").toLowerCase().includes(searchRule.value.toLowerCase());
            });
        });

        const handleEditRules = (index, row) => {
            achievementRules.show = true;
            achievementRules.achievementId = row.id
            fetchRulesData()
        }

        const handleEdit = (index, row) => {
            formData.id = row.id
            formData.title = row.title
            formData.description = row.description
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
                    window.$axios.post("/achievement/achievement/delete", {
                        "id": row.id
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
            formData.title = ""
            formData.description = ""
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
                    window.$axios.post("/achievement/achievement/add", {
                        "title": formData.title,
                        "description": formData.description
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
                    window.$axios.post("/achievement/achievement/update", {
                        "id": formData.id,
                        "title": formData.title,
                        "description": formData.description,
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
            window.$axios.get("/achievement/achievement/all", {
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

        const fetchRulesData = () => {
            achievementRules.loading = true;
            window.$axios.post("/achievement/achievement_rules/get", {
                "id": achievementRules.achievementId
            }, {
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("access_token")
                }
            }).then(response => {
                if (response.status == 200) {
                    if (response.data.code == 200) {
                        achievementRules.value = response.data.data || []
                    } else {
                        ElMessage({
                            message: `获取规则失败，${response.data.message}`,
                            type: 'error',
                        })
                    }
                } else {
                    ElMessage({
                        message: `获取规则失败，code: ${response.status}`,
                        type: 'error',
                    })
                }
                achievementRules.loading = false
            }).catch(error => {
                ElMessage({
                    message: `获取规则失败，请检查网络`,
                    type: 'error',
                })
                console.error(error)
                achievementRules.loading = false
            })
        }

        const cancelRuleForm = (e) => {
            ruleFormData.id = "auto";
            ruleFormData.achievement_id = achievementRules.achievementId;
            ruleFormData.primary_subject = '';
            ruleFormData.secondary_subject = '';
            ruleFormData.tertiary_subject = '';
            ruleFormData.level = '其他';
            ruleFormData.text_info = true;
            ruleFormData.requires_file = true;
            ruleFormData.score = 0;

            achievementRules.editing = false
            achievementRules.uploading = false
            if (e === true) {
                fetchRulesData()
            }
        }

        const addRule = () => {
            cancelRuleForm(false)
            achievementRules.editing = true
        }

        const editRule = (index, row) => {
            ruleFormData.id = row.id;
            ruleFormData.achievement_id = achievementRules.achievementId;
            ruleFormData.primary_subject = row.primary_subject;
            ruleFormData.secondary_subject = row.secondary_subject;
            ruleFormData.tertiary_subject = row.tertiary_subject;
            ruleFormData.level = row.level;
            ruleFormData.text_info = row.text_info;
            ruleFormData.requires_file = row.requires_file;
            ruleFormData.score = row.score;
            achievementRules.editing = true
        };

        const deleteRule = (index, row) => {
            ElMessageBox.confirm("是否确认删除？删除该数据可能会导致其他关联数据错误。", "提示", {
                confirmButtonText: "确认",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    console.log("删除", index, row);
                    window.$axios.post("/achievement/achievement_rules/delete", {
                        "id": row.id
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
                                fetchRulesData()
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

        const updateRule = () => {
            ruleBaseForm.value.validate((valid) => {
                if (!valid) {
                    ElMessage({
                        type: "error",
                        message: "请正确填写表单",
                    });
                    return
                }
                achievementRules.uploading = true;
                if (ruleFormData.id == 'auto') {
                    // 新增
                    window.$axios.post("/achievement/achievement_rules/add", {
                        "achievement_id": ruleFormData.achievement_id,
                        "primary_subject": ruleFormData.primary_subject,
                        "secondary_subject": ruleFormData.secondary_subject,
                        "tertiary_subject": ruleFormData.tertiary_subject,
                        "level": ruleFormData.level,
                        "text_info": ruleFormData.text_info,
                        "requires_file": ruleFormData.requires_file,
                        "score": ruleFormData.score,
                    }, {
                        headers: {
                            "Authorization": "Bearer " + localStorage.getItem("access_token")
                        }
                    }).then(response => {
                        if (response.status == 200) {
                            if (response.data.code == 200) {
                                cancelRuleForm(true)
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
                        achievementRules.uploading = false;
                    }).catch(error => {
                        ElMessage({
                            message: `新增数据失败，请检查网络`,
                            type: 'error',
                        })
                        console.error(error)
                        achievementRules.uploading = false
                    })
                } else {
                    window.$axios.post("/achievement/achievement_rules/update", {
                        "id": ruleFormData.id,
                        "achievement_id": ruleFormData.achievement_id,
                        "primary_subject": ruleFormData.primary_subject,
                        "secondary_subject": ruleFormData.secondary_subject,
                        "tertiary_subject": ruleFormData.tertiary_subject,
                        "level": ruleFormData.level,
                        "text_info": ruleFormData.text_info,
                        "requires_file": ruleFormData.requires_file,
                        "score": ruleFormData.score,
                    }, {
                        headers: {
                            "Authorization": "Bearer " + localStorage.getItem("access_token")
                        }
                    }).then(response => {
                        if (response.status == 200) {
                            if (response.data.code == 200) {
                                cancelRuleForm(true)
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
                        achievementRules.uploading = false;
                    }).catch(error => {
                        ElMessage({
                            message: `编辑数据失败，请检查网络`,
                            type: 'error',
                        })
                        console.error(error)
                        achievementRules.uploading = false
                    })
                }
            })
        }

        fetchData();

        return {
            search,
            searchRule,
            searchType,
            searchRuleType,
            drawer,
            baseForm,
            tableLoading,
            formData,
            achievementRules,
            ruleFormData,
            ruleBaseForm,

            cancelForm,
            cancelRuleForm,
            selectType,
            selectRuleType,
            filterTableData,
            filterRuleTableData,
            handleEdit,
            handleDelete,
            updateData,
            fetchData,
            fetchRulesData,
            addData,
            addRule,
            updateRule,

            rules,
            ruleFormRules,
            rulescColumns,
            columns,
            levelData,
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

.rules-table-container {
    width: 100%;
    height: calc(100% - 1px);
    border-top: 1px solid var(--el-border-color);
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

.rules-table-row {
    font-size: 12px;
    line-height: 16px;
    padding: 10px 0;
}
</style>
