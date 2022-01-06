<template>
    <div>
        <el-table :data="tableData" style="width: 100%" :span-method="objectSpanMethod">
            <el-table-column label="被征收房屋">
                <el-table-column prop="col1" label="房屋用途"> </el-table-column>
                <el-table-column prop="col2" label="房屋结构"> </el-table-column>
                <el-table-column prop="col3" label="合法建筑面积"> </el-table-column>
                <el-table-column prop="col4" label="兑换比例"> </el-table-column>
                <el-table-column prop="col5" label="兑换用途">
                    <template slot-scope="scope">
                        <el-select v-model="scope.row.col5" @change="change(scope.$index)" placeholder="请选择">
                            <el-option
                              v-for="item in options"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value">
                            </el-option>
                          </el-select>
                    </template>
                </el-table-column>
                <el-table-column prop="col6" label="选择产权调换面积"> </el-table-column>
                <el-table-column prop="col7" label="选择货币补偿面积"> </el-table-column>
            </el-table-column>
            <el-table-column label="安置房屋">
                <el-table-column prop="col8" label="奖励面积">
                    <template slot-scope="scope">
                        <el-input v-model="scope.row.col8" @blur="blur($event,scope)" placeholder="请输入内容"></el-input>
                    </template>
                 </el-table-column>
                <el-table-column prop="col9" label="应安面积"> </el-table-column>
                <el-table-column prop="col10" label="实安面积"> </el-table-column>
                <el-table-column prop="col11" label="超安面积"> </el-table-column>
            </el-table-column>
        </el-table>
        <el-button @click="save">保存</el-button>
    </div>
</template>

<script>
    export default {
        props: {

        },
        data() {
            return {
                options: [{
          value: '0',
          label: '住宅'
        }, {
          value: '1',
          label: '商业'
        }, {
          value: '2',
          label: '农房'
        }, {
          value: '3',
          label: '营业房'
        }, {
          value: '4',
          label: '公房'
        }],
                tableData: [
                    {
                        col1: '1',
                        col2: '1',
                        col3: '1',
                        col4: '1',
                        col5: '',
                        col6: '1',
                        col7: '1',
                        col8: '1',
                        col9: '1',
                        col10: '1',
                        col11: '1',
                        col12: '1',
                    },
                    {
                        col1: '1',
                        col2: '1',
                        col3: '1',
                        col4: '1',
                        col5: '',
                        col6: '1',
                        col7: '1',
                        col8: '1',
                        col9: '1',
                        col10: '1',
                        col11: '1',
                        col12: '1',
                    },
                    {
                        col1: '1',
                        col2: '1',
                        col3: '1',
                        col4: '1',
                        col5: '',
                        col6: '1',
                        col7: '1',
                        col8: '1',
                        col9: '1',
                        col10: '1',
                        col11: '1',
                        col12: '1',
                    },
                    {
                        col1: '1',
                        col2: '1',
                        col3: '1',
                        col4: '1',
                        col5: '',
                        col6: '1',
                        col7: '1',
                        col8: '1',
                        col9: '1',
                        col10: '1',
                        col11: '1',
                        col12: '1',
                    },
                ]
            };
        },
        computed: {

        },
        watch: {

        },
        components: {

        },
        created() {

        },
        mounted() {
        //    setTimeout(() => {
        //        this.tableData[2].col5 = '2'
        //        this.tableData[3].col5 = '2'
        //    }, 3000);
        },
        methods: {
            save(){
                let obj = {}
                this.tableData.map(e=>{
                    if(!obj[e.col5]){
                        obj[e.col5] ={
                            col8:e.col8
                        }
                    }else{
                        e.col8 = obj[e.col5].col8
                    }
                })
                console.log(this.tableData)
            },
            change(index){
                let obj = {}
                this.tableData.map(e=>{
                   if(e.col5){
                       !obj[e.col5]?obj[e.col5] = 1: obj[e.col5] ++
                   }else{
                       !obj['default']?obj['default'] = 1:obj['default'] ++
                   }
                })

                this.tableData.map(e=>{
                    if(e.col5 === ''){
                        e.combineNum = obj['default']
                    }else{
                        e.combineNum = obj[e.col5]
                    }
                    
                })
                this.tableData[index].col8 = ''
                this.tableData.sort((a, b) => a.col5.localeCompare(b.col5))
                // console.log(this.tableData)
                this.save()
                
            },
            blur(val,item){
                // this.tableData.map(e=>{
                //     if(e.col5 == item.row.col5){
                //         e[item.column.property] = item.row[item.column.property]
                //     }
                // })
                this.save()
            },
            objectSpanMethod({ row, column, rowIndex, columnIndex }) {
                
                // 判断是否是需要合并的列
                if (['col8','col9','col10','col11'].includes(column.property)) {
                    if (rowIndex < this.tableData.length) {
                        return {
                            rowspan: this.tableData[rowIndex].combineNum?this.tableData[rowIndex].combineNum:1,
                            colspan: 1,
                        };
                    } else {
                        return {
                            rowspan: 0,
                            colspan: 0,
                        };
                    }
                } else {
                    return;
                }
            },
        },
    };
</script>

<style scoped>

</style>