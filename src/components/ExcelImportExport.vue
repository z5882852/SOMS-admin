<template>
    <el-dialog title="导入" v-model="dialogVisible" width="50%" :before-close="handleClose">
        <div class="dialog-content">
            <!-- 步骤 1：文件上传 -->
            <div v-if="!fileLoaded">
                <el-text size="large">请选择文件</el-text>
                <el-upload :disabled="false" class="upload" drag :limit="1" action="#" :http-request="getUploadUrl"
                    :file-list="selectFile" :on-change="changeFile" :on-exceed="outFileExceed" :on-remove="removeFile"
                    accept=".xlsx,.xls">
                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                    <div class="el-upload__text">
                        拖拽文件到此处或点击上传
                    </div>
                    <template #tip>
                        <div class="el-upload__tip">
                            只支持 Excel 文件（.xlsx, .xls）
                        </div>
                    </template>
                </el-upload>
            </div>

            <!-- 步骤 2：选择工作表 -->
            <div v-if="fileLoaded && !sheetSelected">
                <el-form>
                    <el-form-item label="选择数据表">
                        <el-select v-model="selectedSheet" placeholder="请选择工作表" @change="handleSheetSelect">
                            <el-option v-for="sheet in sheetNames" :key="sheet" :label="sheet" :value="sheet" />
                        </el-select>
                    </el-form-item>
                </el-form>
            </div>

            <!-- 步骤 3：映射源字段与目标字段 -->
            <div v-if="sheetSelected && !previewReady">
                <el-text size="large">请选择映射字段</el-text>
                <el-table :data="mappedFields" style="width: 100%; height: 300px; margin-top: 10px;" :show-summary="false" border>
                    <el-table-column label="源字段">
                        <template #default="scope">
                            <el-select v-model="scope.row.sourceField" placeholder="请选择源字段" style="width: 100%">
                                <el-option v-for="field in availableFields" :key="field" :label="field"
                                    :value="field" />
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column label="目标字段" prop="targetField"></el-table-column>
                    <el-table-column label="正则规则（不需要则留空）">
                        <template #default="scope">
                            <el-input v-model="scope.row.regex" placeholder="请输入正则" style="width: 100%" />
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 步骤 4：预览数据 -->
            <div v-if="previewReady">
                <el-text size="large">导入预览</el-text>
                <el-table :data="previewData" style="width: 100%; height: 300px; margin-top: 10px;" :show-summary="false" border>
                    <el-table-column v-for="field in targetFields" :key="field.name" :label="field.name" :prop="field.name"></el-table-column>
                </el-table>
            </div>
        </div>

        <div slot="footer" class="dialog-footer">
            <el-button @click="handleClose">取消</el-button>
            <el-button v-if="!previewReady" type="primary"
                :disabled="!sheetSelected || mappedFields.some(field => !field.sourceField)" @click="generatePreview">
                下一步
            </el-button>
            <el-button v-if="previewReady" type="primary" @click="handleImport">导入</el-button>
        </div>
    </el-dialog>
</template>

<script>
import * as XLSX from 'xlsx';

export default {
    name: 'ExcelImportExport',
    data() {
        return {
            dialogVisible: false,
            sheetNames: [],
            selectedSheet: null,
            availableFields: [],
            mappedFields: [],
            importedData: [],
            headers: [],
            fileLoaded: false,
            sheetSelected: false,
            previewReady: false,
            previewData: [],
            workbook: null,
            selectFile: [],
            targetFields: [],  // 目标字段（传入的字段格式包含name和value）
            onImportSuccess: null,  // 回调函数
            processedData: [],
        };
    },
    methods: {
        getUploadUrl(file) {
            return new Promise((resolve) => {
                resolve({ url: '#', file });
            });
        },
        changeFile(file, fileList) {
            this.selectFile = fileList;
            const reader = new FileReader();
            reader.onload = (e) => {
                const binaryString = e.target.result;
                this.workbook = XLSX.read(binaryString, { type: 'binary' });
                this.sheetNames = this.workbook.SheetNames;
                this.fileLoaded = true;
            };
            reader.readAsBinaryString(file.raw);
        },
        outFileExceed(file, fileList) {
            this.$message.warning(`只能上传一个文件！`);
        },
        removeFile(file, fileList) {
            this.resetState();
        },
        handleSheetSelect(sheetName) {
            const sheet = this.workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            this.headers = jsonData[0];
            this.importedData = jsonData.slice(1);
            this.availableFields = Object.values(this.headers);
            this.sheetSelected = true;

            this.mappedFields = this.targetFields.map(targetField => ({
                targetField: targetField.name,
                sourceField: this.availableFields[0],
                regex: ''
            }));
        },
        generatePreview() {
            this.previewData = this.importedData.slice(0, 10).map(row => {
                const mappedRow = {};
                this.mappedFields.forEach(mapping => {
                    const sourceIndex = this.headers.indexOf(mapping.sourceField);
                    let value = sourceIndex !== -1 ? row[sourceIndex] : null;

                    // 如果有正则，则应用正则
                    if (mapping.regex) {
                        const regex = new RegExp(mapping.regex);
                        value = regex.test(value) ? value.match(regex)[1] : null;
                    }
                    mappedRow[mapping.targetField] = value;
                });
                return mappedRow;
            });
            this.previewReady = true;
        },

        handleImport() {
            this.processedData = this.importedData.map(row => {
                const mappedRow = {};
                this.mappedFields.forEach(mapping => {
                    const sourceIndex = this.headers.indexOf(mapping.sourceField);
                    let value = sourceIndex !== -1 ? row[sourceIndex] : null;

                    // 如果有正则，则应用正则
                    if (mapping.regex) {
                        const regex = new RegExp(mapping.regex);
                        value = regex.test(value) ? value.match(regex)[1] : null;
                    }
                    mappedRow[mapping.targetField] = value;
                });
                return mappedRow;
            });

            if (this.previewData.length === 0) {
                this.$message.error('没有数据可以导入！');
                return;
            }

            if (this.onImportSuccess) {
                this.onImportSuccess(this.processedData);
            }

            this.handleClose();
        },
        handleClose() {
            this.dialogVisible = false;
            this.resetState();
        },
        resetState() {
            this.sheetNames = [];
            this.selectedSheet = null;
            this.availableFields = [];
            this.mappedFields = [];
            this.importedData = [];
            this.headers = [];
            this.fileLoaded = false;
            this.sheetSelected = false;
            this.previewReady = false;
            this.previewData = [];
            this.workbook = null;
            this.selectFile = [];
        },
        openDialog(fields, callback) {
            this.targetFields = fields;
            this.onImportSuccess = callback;
            this.dialogVisible = true;
        }
    }
};
</script>



<style scoped>
.dialog-content {
    min-height: 300px;
    margin-bottom: 10px;
}

.dialog-content-title {
    margin-bottom: 10px;
}

.dialog-footer {
    display: flex;
    justify-content: space-between;
}

.upload {
    margin-top: 10px;
}

.el-upload {
    margin-bottom: 20px;
}

.el-upload__text em {
    color: #409EFF;
}

.el-table {
    overflow: auto;
}
</style>