<template>
  <div
    class="grid grid-cols-7 py-2 gap-2 flex-1 overflow-y-auto [grid-auto-rows:minmax(7.5rem,_1fr)]"
  >
    <div
      v-for="date in calendarDays"
      :key="date.date"
      :class="[
        'flex flex-col items-center border rounded transition-transform duration-200 hover:-translate-y-1 relative shadow-md',
        isCurrentMonth(date.date) ? '' : 'bg-gray-200',
      ]"
      @click="openForm(date.date)"
    >
      <div class="flex items-center justify-center pt-3">
        {{ new Date(date.date).getDate() }}
      </div>
    </div>
  </div>

  <TimeForm
    v-if="showModal"
    :close="closeForm"
    :selectedDate="selectedDate"
    :year="year"
    :month="month"
    @save="onSave"
    @delete="onDelete"
  />
</template>

<script setup>
import TimeForm from "@/components/forms/TimeForm.vue";

const props = defineProps({
  calendarDays: Array,
  year: Number,
  month: Number,
});

const emit = defineEmits(["save, delete"]);

const onSave = (data) => {
  emit("save", data);
};

const onDelete = (data) => {
  emit("delete", data);
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
