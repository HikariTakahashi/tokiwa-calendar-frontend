<template>
  <div
    class="grid grid-cols-7 py-1 gap-2 flex-1 overflow-y-auto [grid-auto-rows:minmax(7.5rem,_1fr)]"
  >
    <div
      v-for="date in calendarDays"
      :key="date.date"
      class="flex flex-col items-center border rounded transition-transform duration-200 hover:-translate-y-1 relative shadow-md"
      :class="[isCurrentMonth(date.date) ? '' : 'bg-gray-100']"
      @click="openForm(date.date)"
    >
      <div
        class="flex items-center justify-center pt-3"
        :class="[isCurrentMonth(date.date) ? 'text-black' : 'text-gray-500']"
      >
        {{ new Date(date.date).getDate() }}
      </div>
      <div
        v-if="timeData[date.date]"
        class="text-center font-bold text-blue-500"
      >
        {{ timeData[date.date].start }} ~ {{ timeData[date.date].end }}
      </div>
    </div>
  </div>

  <TimeForm
    v-if="showModal"
    :close="closeForm"
    :selectedDate="selectedDate"
    :year="year"
    :month="month"
    :existingTime="timeData[selectedDate] || {}"
    @save="onSave"
    @delete="onDelete"
  />
</template>

<script setup>
import TimeForm from "@/components/forms/TimeForm.vue";
import { ref } from "vue";

const props = defineProps({
  calendarDays: Array,
  year: Number,
  month: Number,
});

const emit = defineEmits(["save", "delete", "update:time-data"]);

const timeData = ref({});

const onSave = (data) => {
  timeData.value[data.date] = {
    start: data.start,
    end: data.end,
  };
  emit("update:time-data", timeData.value);
};

const onDelete = (data) => {
  delete timeData.value[data.date];
  emit("update:time-data", timeData.value);
};

const isCurrentMonth = (dateString) => {
  const d = new Date(dateString);
  return d.getFullYear() === props.year && d.getMonth() + 1 === props.month;
};

const showModal = ref(false);
const selectedDate = ref(null);

const openForm = (date) => {
  selectedDate.value = date;
  showModal.value = true;
};

const closeForm = () => {
  showModal.value = false;
};
</script>
