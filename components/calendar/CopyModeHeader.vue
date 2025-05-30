<template>
  <div
    class="flex flex-col sm:flex-row justify-between items-center py-2 sx:py-1 px-2"
  >
    <div class="flex items-center text-2xl font-bold mb-2 sm:mb-0 gap-x-5 ">
      <buttons-circle @click="CloseCopyMode">
        <UIcon name="ic:sharp-clear" class="size-8" />
      </buttons-circle>
      <div class="flex flex-col sm:flex-row items-end gap-x-2">
        <h1 class="font-mono text-blue-500">コピーモード</h1>
        <button @click="cancelCopyMode" class="text-sm text-gray-500 hover:text-gray-700">コピーモードをキャンセルする</button>
      </div>
    </div>

    <div class="flex items-center gap-x-4">
      <div class="border-r border-gray-400 pr-4">
        <CalendarDays
          :current-year="currentYear"
          :current-month="currentMonth"
        />
      </div>
      <buttons-circle @click="openForm" :isUse="false">
        <UIcon name="ic:outline-download-for-offline" class="size-5" />
      </buttons-circle>
      <buttons-circle @click="$emit('prev-month')">
        <UIcon name="ic:baseline-arrow-back-ios-new" class="size-5" />
      </buttons-circle>
      <buttons-circle @click="$emit('next-month')">
        <UIcon name="ic:baseline-arrow-forward-ios" class="size-5" />
      </buttons-circle>
    </div>
  </div>

  <Teleport to="body">
    <UploadForm v-if="showModal" @close="closeForm" :time-data="timeData" />
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import UploadForm from "@/components/forms/UploadForm.vue";

defineProps({
  currentYear: Number,
  currentMonth: Number,
  currentDay: Number,
  currentWeek: Number,
  timeData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["next-month", "prev-month", "close-copy-mode", "cancel-copy-mode"]);

const showModal = ref(false);

const openForm = () => {
  showModal.value = true;
};

const CloseCopyMode = () => {
  showModal.value = false;
  emit("close-copy-mode");
};

const cancelCopyMode = () => {
  emit("cancel-copy-mode");
};

const handleKeyDown = (e) => {
  if (e.key === "Escape") {
    cancelCopyMode();
  } else if (e.key === "Enter") {
    CloseCopyMode();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>
