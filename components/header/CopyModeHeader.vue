<template>
  <div
    class="flex flex-col sm:flex-row justify-between items-center py-2 sx:py-1 px-2"
  >
    <div class="flex items-center mb-2 sm:mb-0 gap-x-5">
      <buttons-circle @click="CloseCopyMode">
        <UIcon name="ic:sharp-clear" class="size-8" />
      </buttons-circle>
      <div class="flex items-end gap-x-2">
        <p class="text-2xl font-bold font-mono text-blue-500">コピーモード</p>
        <p class="hidden sm:block text-sm font-bold text-gray-500">
          Enterキーでモードを終了できます。
        </p>
      </div>
    </div>

    <div class="flex sm:items-center gap-x-4">
      <div class="border-r border-gray-400 pr-4">
        <CalendarDays
          :current-year="currentYear"
          :current-month="currentMonth"
        />
      </div>
      <buttons-circle @click="openForm" :isUse="false">
        <UIcon name="ic:baseline-file-upload" class="size-5" />
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
    <UploadForm
      v-if="showModal"
      @close="closeForm"
      :time-data="timeData"
      :space-id="timeData.spaceId || ''"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";
import UploadForm from "@/components/forms/UploadForm.vue";
import type { TimeData } from "@/composables/useAPI";

interface Props {
  currentYear: number;
  currentMonth: number;
  currentDay: number;
  currentWeek: number;
  timeData: TimeData;
}

const props = withDefaults(defineProps<Props>(), {
  timeData: () => ({
    events: {},
    spaceId: "",
    username: "",
    userColor: "",
  }),
});

const emit = defineEmits(["next-month", "prev-month", "close-copy-mode"]);

// UploadForm関連の状態管理
const showModal = ref(false);

const openForm = () => {
  showModal.value = true;
};

const closeForm = () => {
  showModal.value = false;
};

const CloseCopyMode = () => {
  emit("close-copy-mode");
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter") {
    CloseCopyMode();
  } else if (e.key === "ArrowRight") {
    emit("next-month");
  } else if (e.key === "ArrowLeft") {
    emit("prev-month");
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>
