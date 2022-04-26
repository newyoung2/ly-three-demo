<template>
  <div class="home">
    <div class="openNav">
      <el-button
        type="primary"
        @click="drawer = true"
        round
      >菜单</el-button>
    </div>

    <el-drawer
      title="three学习示例（刘洋）"
      :visible.sync="drawer"
      :direction="direction"
    >
      <div style="padding:10px 10px 20px;">
        <el-input
          placeholder="请输入内容"
          size="small"
          suffix-icon="el-icon-search"
          v-model="input2"
        >
        </el-input>
      </div>
      <div class="nav">
        <el-collapse
          style="width:100%;"
          v-model="activeName"
        >
          <el-collapse-item
            :title="`${item.title}-----------(${item.children.length})`"
            :name="item.title"
            v-for="(item,index) in menulistFilter"
            :key="index"
          >
            <div class="nav1">
              <div
                class="btnitem"
                v-for="(item1,index1) in item.children"
                :key="index1"
              >
                <el-button
                  size="small"
                  type="danger"
                  
                  @click="$router.push(item1.value)"
                >{{item1.name}}</el-button>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>

      </div>

    </el-drawer>

    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import menu from '../menu'

export default {
  name: "Home",
  data() {
    return {
      showNav: false,
      drawer: false,
      direction: "ltr",
      input2: "",
      activeName: [],
      menulist: menu,
    };
  },
  computed: {
    menulistFilter() {
      let arr = [];
      if (this.input2 == "") {
        arr = this.menulist;
        /* 搜索条件为空的时候  关闭折叠面板 */
        this.activeName = [];
      } else {
        /* 输入搜索条件 过滤出包含搜索条件的示例名 */
        this.menulist.forEach((e) => {
          let obj = JSON.parse(JSON.stringify(e));
          obj.children = e.children.filter((e1) => {
            return (
              e1.name.toUpperCase().indexOf(this.input2.toUpperCase()) > -1
            );
          });
          if (obj.children.length != 0) {
            arr.push(obj);
          }
        });

        /* 展开折叠面板 */
        this.activeName = this.menulist.map((e) => {
          return e.title;
        });
      }

      return arr;
    },
  },
  mounted() {
    // console.log(test)
  },
};
</script>

<style lang="scss" scoped>
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background-color: gray;
}

::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.04);
  background: #ededed;
  border-radius: 5px;
}

.home {
  position: relative;
}

.openNav {
  position: absolute;
  left: 1%;
  top: 1vh;
  z-index: 9;
}

.nav {
  width: 100%;
  height: 75vh;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  padding: 0 10px;
}

.nav1 {
  width: 100%;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
}

.nav_item {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  width: 120px;
  cursor: pointer;
}

.nav_item:hover {
  color: blue;
}

.content {
  width: 100%;
  height: 100vh;
}

.btnitem {
  padding: 8px;
}
</style>
