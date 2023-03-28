<!-- Please remove this file from your project -->
<template>
  <b-container fluid="lg">
    <h1>@ Task Manager</h1>
    <b-button v-b-modal.modal-add class="float-right mb-5"
      >Add new task</b-button
    >
    <b-table :items="items" :fields="fields">
      <template #cell(name)="data">
        {{ data.value }} <img v-show="showStatus(data.item) !== undefined" :src="`/${showStatus(data.item) ? 'check' : 'error'}.png`" />
      </template>
      <template #cell(createdAt)="data">
        {{ formatDate(data.value) }}
      </template>
      <template #cell(executeTime)="data">
        {{ formatExecutionTime(data.value) }}
      </template>
      <template #cell(status)="data">
        {{ formatStatus(data.value) }}
      </template>
      <template #cell(delete)="data">
        <a v-b-modal.modal-delete @click="handleClickDelete(data.item)"
          >Delete</a
        >
      </template>
      <template #cell(detail)="data">
        <a class="pointer" @click="handleClickDetail(data.item)"
          >Detail</a
        >
      </template>
    </b-table>

    <b-modal @ok="addNewTask()" id="modal-add" title="Add new task">
      <b-form-group label="Task name" label-for="name-input">
        <b-form-input
          id="name-input"
          v-model="taskNameAdd"
          required
        ></b-form-input>
      </b-form-group>
      <b-form-group label="Configuration" label-for="config-input">
            <prism-editor
      class="my-editor height-300 prism-editor__editor"
            :highlight="highlighter"
      v-model="taskConfigAdd"
    >aaaa</prism-editor>
      </b-form-group>
    </b-modal>
    <b-modal id="modal-delete" hide-header @ok="handOkDelete">
      Delete {{ taskNameDelete }}?
    </b-modal>
  </b-container>
</template>

<script>
import { PrismEditor } from "vue-prism-editor";
import "vue-prism-editor/dist/prismeditor.min.css"; // import the styles somewhere

// import highlighting library (you can use any library you want just return html string)
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-ini";
import "prismjs/themes/prism-tomorrow.css"; // import syntax highlighting styles
import {BIcon,     BIconArrowUp,
    BIconArrowDown
} from 'bootstrap-vue'
import 'bootstrap-vue/dist/bootstrap-vue-icons.min.css'
import axios from "axios";

export default {
  components: {
    PrismEditor,
    BIcon,    
    BIconArrowUp,
    BIconArrowDown

  },
  name: "NuxtTutorial",
  data() {
    return {
      fields: [
        {
          key: "name",
          label: "Name",
        },
        {
          key: "createdAt",
          label: "Creation Date",
        },
        {
          key: "executeTime",
          label: "Execution Time",
        },
        {
          key: "status",
          label: "Status",
        },
        {
          key: "delete",
          label: " ",
        },
        {
          key: "detail",
          label: " ",
        },
      ],
      items: [],
      taskNameAdd: "",
      taskConfigAdd: `[general] \nmagic_number=42\nmy_name="slim shady"`,
      taskNameDelete: "",
      taskIdDelete: "",
      detailIdDisplay: "",
      tableDetail: [],
      tableDetailFields: ["name", "size", "action"],
    };
  },
  async mounted() {
    await this.fetchData();
    setInterval(() => {
      this.fetchData()
    }, 10000)
  },
  methods: {
    async fetchData() {
      let data = await axios.get(`/api/tasks`);
      this.items = data.data;
    },
    async addNewTask() {
      await axios.post(`/api/add`, {
        name: this.taskNameAdd,
        config: this.taskConfigAdd,
      });
      await this.fetchData();
    },
    async handOkDelete() {
      await axios.delete(`/api/delete/${this.taskIdDelete}`);
      await this.fetchData();
    },
    formatStatus(value) {
      if (value == 0) {
        return "Queued";
      } else if (value == 1) {
        return "Working";
      } else {
        return "Done";
      }
    },
    formatDate(value) {
      return new Date(value).toLocaleString();
    },
    handleClickDelete(data) {
      this.taskNameDelete = data.name;
      this.taskIdDelete = data.id;
    },
    async handleClickDetail(data) {
      window.open(`/detail?id=${data.id}`, '_blank').focus()

    },
    handleDownload(data) {
      window.open(
        `/api/download/${this.detailIdDisplay}/${data.name}`
      );
    },
    highlighter(code) {
      return highlight(code, languages.ini); //returns html
    },
    showStatus(status) {
      if (status.isSuccess !== null) {
        if (status.isSuccess === 0 ){
          return true
        }
        return false
      }
      return undefined
    },
    formatExecutionTime(duration) {
      
      try {
        if (!duration) {
          return "_"
        }
        if (duration < 1000) {
          return '1s'
        }

        const portions = [];

        const msInHour = 1000 * 60 * 60;
        const hours = Math.trunc(duration / msInHour);
        if (hours > 0) {
          portions.push(hours + " hours");
          duration = duration - hours * msInHour;
        }

        const msInMinute = 1000 * 60;
        const minutes = Math.trunc(duration / msInMinute);
        if (minutes > 0) {
          portions.push(minutes + " minutes");
          duration = duration - minutes * msInMinute;
        }

        const seconds = Math.trunc(duration / 1000);
        if (seconds > 0) {
          portions.push(seconds + "s");
        }

        return portions.join(" ");
      } catch (e) {
        console.log(e);
        return "111";
      }
    },
  },
};
</script>
<style>
a {
  text-decoration-line: underline !important;
}

.my-editor {

  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
}

.prism-editor__textarea:focus {
  outline: none;
}

.height-300 {
  width: 466px;
  padding: 0;
  border: 1px solid #ced4da;
}
pre {
  height: 158px !important;
  padding: 5px;
}
img {
  width: 20px;
  height: 20px;
}
.pointer {
  cursor: pointer;
  color: black;
}
</style>