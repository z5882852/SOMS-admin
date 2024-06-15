<template>
    <div class="console-container card">
        <el-row style="height: 100%;">
            <el-col :span="12" style="height: 100%;">
                <el-select-v2 v-model="searchType" :options="selectType" placeholder="Please select"
                    style="width: 80px" />
                <el-input class="search-input" v-model="search" placeholder="搜索"></el-input>
            </el-col>
            <el-col :span="12" style="height: 100%; text-align: right;">
                <el-button type="primary" icon="Plus" style="margin-right: 20px;">新增用户</el-button>
            </el-col>
        </el-row>
    </div>
    <div class="table-container card ">
        <el-auto-resizer>
            <template #default="{ height, width }">
                <el-table-v2 :columns="columns" :data="filterTableData" :width="width" :height="height" fixed />
            </template>
        </el-auto-resizer>
    </div>
    <el-drawer v-model="drawer.show" title="编辑用户信息" direction="rtl" size="500px">
        <div class="edit-drawer__content">
            <!-- <el-form :model="form">
                <el-form-item label="Name" :label-width="formLabelWidth">
                    <el-input v-model="form.name" autocomplete="off" />
                </el-form-item>
                <el-form-item label="Area" :label-width="formLabelWidth">
                    <el-select v-model="form.region" placeholder="Please select activity area">
                        <el-option label="Area1" value="shanghai" />
                        <el-option label="Area2" value="beijing" />
                    </el-select>
                </el-form-item>
            </el-form> -->
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
import { ElButton } from "element-plus";



export default {
    name: 'User',
    mounted() {
    },
    setup() {
        // 动态信息
        const search = ref('');
        const searchType = ref('name');
        const drawer = reactive({
            show: true,
            loading: false
        })


        const cancelForm = () => {
            drawer.show = false
            drawer.loading = false
        }


        // 定值
        const selectType = [
            {
                value: 'name',
                label: '姓名',
            },
            {
                value: 'student_id',
                label: '学号',
            }
        ]
        const tableData = [
            {
                user_id: '1',
                name: '李四',
                student_id: '22104030221',
                collage: '侦查学院',
                class: '22级侦查学一区',
                major: '侦查学'
            },
            {
                user_id: '2',
                name: '张三',
                student_id: '22104030228',
                collage: '信息技术学院',
                class: '22级数据科学与大数据技术二区',
                major: '数据科学与大数据技术'
            },
        ];
        const columns = [
            {
                key: 'user_id',
                dataKey: 'user_id',
                title: 'id',
                align: 'center',
                width: 100
            },
            {
                key: 'name',
                dataKey: 'name',
                title: '姓名',
                width: 150
            },
            {
                key: 'student_id',
                dataKey: 'student_id',
                title: '学号',
                width: 150
            }, 
            {
                key: 'collage',
                dataKey: 'collage',
                title: '二级学院',
                width: 150
            }, 
            {
                key: 'class',
                dataKey: 'class',
                title: '班级',
                width: 300
            }, 
            {
                key: 'major',
                dataKey: 'major',
                title: '专业',
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
                            { onClick: () => handleEdit(data.rowIndex, data.rowData), size: "small", icon: "Edit", circle: true },
                        ),
                        h(
                            ElButton,
                            { onClick: () => handleDelete(data.rowIndex, data.rowData), size: "small", type: "danger", icon: "Delete", circle: true }
                        )
                    ])
                ),
            },
        ];

        const filterTableData = computed(() => {
            return tableData.filter(data => {
                return !search.value || data[searchType.value].toLowerCase().includes(search.value.toLowerCase());
            });
        });

        const handleEdit = (index, row) => {
            drawer.show = true
            console.log("编辑", index, row);
        };

        const handleDelete = (index, row) => {
            console.log("删除", index, row);
        };


        const updateData = () => {
            drawer.loading = true
        }

        return {
            search,
            searchType,
            drawer,

            cancelForm,
            selectType,
            filterTableData,
            handleEdit,
            handleDelete,
            updateData,
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


