<!-- Please remove this file from your project -->
<template>
  <b-container fluid="lg">
    <h1>@ Task Manager</h1>
    <b-button v-b-modal.modal-add class="float-right mb-5"
      >Add new task</b-button
    >
    <b-table :items="items" :fields="fields">
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
        <a v-b-modal.modal-detail @click="handleClickDetail(data.item)"
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
        <b-form-textarea
          id="config-input"
          v-model="taskConfigAdd"
          required
          :rows="6"
        ></b-form-textarea>
      </b-form-group>
    </b-modal>
    <b-modal id="modal-delete" hide-header @ok="handOkDelete">
      Delete {{ taskNameDelete }}?
    </b-modal>
    <b-modal id="modal-detail" hide-header hide-footer @ok="handOkDelete">
      <b-table :items="tableDetail" :fields="tableDetailFields" size="lg">
        <template #cell(action)="data">
          <a @click="handleDownload(data.item)">Open</a>
        </template>
      </b-table>
    </b-modal>
  </b-container>
</template>

<script>
import axios from "axios";
import { BACKEND_URL } from "../config.js";
export default {
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
      taskConfigAdd: "",
      taskNameDelete: "",
      taskIdDelete: "",
      detailIdDisplay: "",
      tableDetail: [],
      tableDetailFields: ["name", "size", "action"],
    };
  },
  async mounted() {
    await this.fetchData();
  },
  methods: {
    async fetchData() {
      let data = await axios.get(`${BACKEND_URL}/tasks`);
      this.items = data.data;
    },
    async addNewTask() {
      await axios.post(`${BACKEND_URL}/add`, {
        name: this.taskNameAdd,
        config: this.taskConfigAdd,
      });
      await this.fetchData();
    },
    async handOkDelete() {
      await axios.delete(`${BACKEND_URL}/delete/${this.taskIdDelete}`);
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
      this.taskIdDelete = data._id;
    },
    async handleClickDetail(data) {
      this.detailIdDisplay = data._id;
      const result = await axios.get(`${BACKEND_URL}/detail/${data._id}`);
      this.tableDetail = result.data;
    },
    handleDownload(data) {
      window.open(
        `${BACKEND_URL}/download/${this.detailIdDisplay}/${data.name}`
      );
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
<style scoped>
a {
  text-decoration-line: underline !important;
}
</style>