<template>
  <div class="grid grid-cols-7 grid-rows-6 gap-0.5 sm:gap-2 h-full">
    <div
      v-for="date in calendarDays"
      :key="date.date"
      class="flex flex-col items-center border rounded transition-transform duration-200 hover:-translate-y-1 shadow-md"
      :class="[
        isCurrentMonth(date.date) ? '' : 'bg-gray-100',
        props.isCopyMode ? 'cursor-pointer' : '',
        props.isCopyMode && date.date === selectedDate ? 'border-8 border-dashed border-blue-500' : '',
        props.isCopyMode && timeData[date.date] === copiedTimeData ? 'border-8 border-blue-500' : ''
      ]"
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
    :isCopyMode="props.isCopyMode"
    @save="onSave"
    @delete="onDelete"
    @copy="handleCopy"
    @cancel-copy-mode="handleCancelCopyMode"
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
  isCopyMode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["save", "delete", "update:time-data", "update:is-copy-mode", "cancel-copy-mode"]);

const timeData = ref({});
const { formatTimeForDisplay } = useTimeUtils();
const showModal = ref(false);
const selectedDate = ref(null);
const copiedTimeData = ref(null);

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

const closeCopyMode = () => {
  isCopyMode.value = false;
  copiedTimeData.value = null;
  emit("update:is-copy-mode", false);
};

const openForm = (date) => {
  if (props.isCopyMode) {
    if (copiedTimeData.value) {
      timeData.value[date] = copiedTimeData.value;
      emit("update:time-data", timeData.value);
    }
  } else {
    selectedDate.value = date;
    showModal.value = true;
  }
};

const closeForm = () => {
  showModal.value = false;
};

const handleCopy = () => {
  if (selectedDate.value) {
    copiedTimeData.value = timeData.value[selectedDate.value] || null;
  }
  emit("update:is-copy-mode", true);
  showModal.value = false;
  console.log("isCopyMode true");
};

const handleCancelCopyMode = () => {
  if (copiedTimeData.value) {
    Object.keys(timeData.value).forEach(date => {
      if (timeData.value[date] === copiedTimeData.value) {
        delete timeData.value[date];
      }
    });
    emit("update:time-data", timeData.value);
  }
  copiedTimeData.value = null;
  emit("update:is-copy-mode", false);
};
</script>
