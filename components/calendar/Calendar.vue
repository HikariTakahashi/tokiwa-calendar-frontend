<template>
  <div class="grid grid-cols-7 grid-rows-6 gap-0.5 sm:gap-2 h-full">
    <div
      v-for="date in calendarDays"
      :key="date.date"
      class="flex flex-col items-center border rounded transition-transform duration-200 hover:-translate-y-1 shadow-md"
      :class="[isCurrentMonth(date.date) ? '' : 'bg-gray-100']"
      @click="openForm(date.date)"
    >
      <div
        class="flex items-center justify-center sm:pt-2"
        :class="[isCurrentMonth(date.date) ? 'text-black' : 'text-gray-500']"
      >
        {{ new Date(date.date).getDate() }}
      </div>
      <div
        v-if="timeData[date.date]"
        class="text-center text-xs sm:text-sm font-bold text-blue-500 w-full flex flex-col min-h-0"
      >
        <div
          class="overflow-y-auto overflow-x-hidden whitespace-pre-line break-words w-full"
        >
          {{ formatTimeForDisplay(timeData[date.date]) }}
        </div>
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
import { useTimeUtils } from "@/utils/TimeUtils";

const props = defineProps({
  calendarDays: Array,
  year: Number,
  month: Number,
});

const emit = defineEmits(["save", "delete", "update:time-data"]);

const timeData = ref({});
const { formatTimeForDisplay } = useTimeUtils();

const onSave = (data) => {
  timeData.value[data.date] = data.timeSlots;
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
