<template>
          <b-table :items="tableDetail" :fields="tableDetailFields" size="lg">
        <template #cell(action)="data">
          <a @click="handleDownload(data.item)">Open</a>
        </template>
      </b-table>
</template>
<script>
import axios from "axios";

export default {
    name: "Detail",
    data() {
        return {
      tableDetail: [],
      tableDetailFields: ["name", "size", "action"],
        }
    },
    async mounted() {
    const id =this.$route?.query?.id
    const result = await axios.get(`/api/detail/${id}`);
      this.tableDetail = result.data;
    },
    methods: {
            handleDownload(data) {
                const id =this.$route?.query?.id
      window.open(
        `/api/download/${id}/${data.name}`
      );
    },
    }
}
</script>