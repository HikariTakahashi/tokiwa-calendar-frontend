<template>
  <div
    class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border bg-white rounded shadow-lg"
  >
    <div class="pl-5 pr-2 pb-5 rounded-lg w-96 shadow-lg relative">
      <div class="flex justify-between items-center">
        <h2 class="pt-5 text-xl font-bold">
          {{ isCurrentYear ? "" : dateComponents.year + "年" }}
          {{ isCurrentMonth ? "" : dateComponents.month + "月" }}
          {{ dateComponents.day }} 日の時間設定
        </h2>
        <button @click="props.close">
          <UIcon name="ic:sharp-clear" class="size-6 hover:bg-red-500" />
        </button>
      </div>
      <h5 class="pl-2 text-xs mb-2">
        「終日」と表記する場合は00:00に設定してください
      </h5>
      <div class="flex pr-3 justify-center items-center gap-x-2">
        <label>開始時刻</label>
        <div class="border-r border-gray-400 pr-2">
          <date-time-picker
            v-model="startTime"
            type="time"
            minute-interval="5"
            @change="validateTime"
            class="border p-2 rounded"
          />
        </div>
        <date-time-picker
          v-model="endTime"
          type="time"
          minute-interval="5"
          @change="validateTime"
          class="border p-2 rounded"
        />

        <label>終了時刻</label>
      </div>
      <div class="mt-3 flex justify-end gap-x-2">
        <buttons-square @click="save" label="保存" color="bg-blue-200" />
        <buttons-square @click="deleteTime" label="削除" color="bg-red-200" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { DateTimePicker } from "vue-drumroll-datetime-picker";
import "vue-drumroll-datetime-picker/dist/style.css";

const props = defineProps({
  close: Function,
  selectedDate: String,
  year: Number,
  month: Number,
  day: Number,
  existingTime: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["save", "delete"]);

const startTime = ref(props.existingTime.start || "");
const endTime = ref(props.existingTime.end || "");

const dateComponents = computed(() => {
  const parts = props.selectedDate.split("-");
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10),
    day: parseInt(parts[2], 10),
  };
});

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth() + 1;

const isCurrentYear = computed(() => {
  return dateComponents.value.year === currentYear;
});

const isCurrentMonth = computed(() => {
  return (
    dateComponents.value.year === currentYear &&
    dateComponents.value.month === currentMonth
  );
});

const save = () => {
  if (!startTime.value || !endTime.value) {
    alert("開始時刻と終了時刻を入力してください");
    return;
  }

  emit("save", {
    date: props.selectedDate,
    start: startTime.value,
    end: endTime.value,
  });

  props.close();
};

const deleteTime = () => {
  emit("delete", {
    date: props.selectedDate,
  });
  props.close();
};

const onKeyDown = (e) => {
  if (e.key === "Escape") {
    props.close();
  }
};

onMounted(() => window.addEventListener("keydown", onKeyDown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeyDown));
</script>
