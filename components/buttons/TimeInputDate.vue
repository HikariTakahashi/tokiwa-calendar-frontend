<template>
  <div class="mb-4">
    <h3 class="text-lg font-semibold mb-2">時間設定:</h3>
    <div class="max-h-[30vh] overflow-y-auto pr-2" ref="timeSlotsContainer">
      <div v-for="(timeSlot, index) in timeSlots" :key="index">
        <div v-if="timeSlot.username" class="mb-2">
          <h3
            class="text-lg font-bold"
            :style="{ color: timeSlot.userColor || '#3b82f6' }"
          >
            {{ timeSlot.username }}
          </h3>
        </div>
        <div class="flex pr-3 justify-center items-center gap-x-2 mb-2">
          <label>開始時刻</label>
          <div class="border-r border-gray-400 pr-2">
            <component
              :is="shouldUseUserTime(timeSlot) ? UserTime : InputTime"
              v-model:time="timeSlot.start"
              :minute-interval="5"
              :initial-hours="parseTimeSlot(timeSlot.start).hours"
              :initial-minutes="parseTimeSlot(timeSlot.start).minutes"
              @update:time="
                (newStartTime) => handleStartTimeChange(newStartTime, index)
              "
            />
          </div>
          <component
            :is="shouldUseUserTime(timeSlot) ? UserTime : InputTime"
            v-model:time="timeSlot.end"
            :minute-interval="5"
            :initial-hours="parseTimeSlot(timeSlot.end).hours"
            :initial-minutes="parseTimeSlot(timeSlot.end).minutes"
            @update:time="
              (newEndTime) => handleEndTimeChange(newEndTime, index)
            "
          />
          <label>終了時刻</label>
          <buttons-hover
            v-if="timeSlots.length > 1 && !timeSlot.username"
            @click="removeTimeSlot(index)"
            :size="5"
            name="ic:sharp-delete"
            color="bg-red-500"
            :ishover="false"
          />
        </div>
      </div>
      <div class="flex items-center gap-x-5">
        <button
          type="button"
          @click="addTimeSlot"
          class="text-blue-500 pb-2 hover:underline"
        >
          複数時間を入力
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";
import InputTime from "@/components/buttons/InputTime.vue";
import UserTime from "@/components/buttons/UserTime.vue";
import { useTimeUtils } from "@/utils/TimeUtils";
import { useDeleteUtils } from "@/utils/DeleteUtils";

const props = defineProps({
  timeSlots: {
    type: Array,
    required: true,
  },
  allowOtherEdit: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "update:timeSlots",
  "startTimeChange",
  "endTimeChange",
  "addTimeSlot",
  "removeTimeSlot",
]);

const {
  addTimeSlot: addTimeSlotBase,
  validateTime,
  validateTimeOrder,
  validateTimeOverlap,
} = useTimeUtils();

const { removeTimeSlotAtIndex } = useDeleteUtils();

const timeSlotsContainer = ref(null);

const parseTimeSlot = (timeString) => {
  if (!timeString) return { hours: 0, minutes: 0 };
  const [hours, minutes] = timeString.split(":").map(Number);
  return { hours, minutes };
};

const addTimeSlot = () => {
  // ユーザー名が存在する時間スロットの後に新しい時間スロットを追加
  const userSlotIndex = props.timeSlots.findIndex((slot) => slot.username);
  if (userSlotIndex !== -1) {
    const newTimeSlots = [...props.timeSlots];
    newTimeSlots.splice(userSlotIndex + 1, 0, {
      start: "00:00",
      end: "00:00",
    });
    emit("update:timeSlots", newTimeSlots);
  } else {
    // 直接新しいスロットを追加
    const newTimeSlots = [...props.timeSlots];
    newTimeSlots.push({
      start: "00:00",
      end: "00:00",
    });
    emit("update:timeSlots", newTimeSlots);
  }

  nextTick(() => {
    if (timeSlotsContainer.value) {
      timeSlotsContainer.value.scrollTop =
        timeSlotsContainer.value.scrollHeight;
    }
  });
};

const removeTimeSlot = (index) => {
  // ユーザーデータの場合は削除を許可しない
  const slotToRemove = props.timeSlots[index];
  if (slotToRemove.username) {
    return;
  }

  // DeleteUtilsを使用して個別削除を実行
  const updatedSlots = removeTimeSlotAtIndex(props.timeSlots, index);
  emit("update:timeSlots", updatedSlots);
};

const shouldUseUserTime = (timeSlot) => {
  // allowOtherEditがtrueの場合は、usernameが含まれていてもInputTimeを使用
  if (props.allowOtherEdit) {
    return false;
  }
  // allowOtherEditがfalseの場合は、従来通りusernameが含まれている場合はUserTimeを使用
  return timeSlot.username;
};

const handleStartTimeChange = (newStartTime, index) => {
  // 開始時刻が変更された時に、終了時刻に+1時間を設定
  if (newStartTime && newStartTime !== "00:00") {
    const startTime = new Date(`2000-01-01T${newStartTime}`);
    const currentEndTime = props.timeSlots[index].end;

    // 現在の終了時刻が有効な場合、開始時刻との差を計算
    if (
      currentEndTime &&
      currentEndTime !== "00:00" &&
      currentEndTime !== "24:00"
    ) {
      const currentEnd = new Date(`2000-01-01T${currentEndTime}`);
      const timeDifference = currentEnd.getTime() - startTime.getTime();

      // 時間差が1時間未満の場合は+1時間に設定
      if (timeDifference < 60 * 60 * 1000) {
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1時間

        // 24時間を超える場合は24:00に設定
        if (endTime.getHours() === 0) {
          const updatedTimeSlots = [...props.timeSlots];
          updatedTimeSlots[index].end = "24:00";
          emit("update:timeSlots", updatedTimeSlots);
        } else {
          const endHours = endTime.getHours().toString().padStart(2, "0");
          const endMinutes = endTime.getMinutes().toString().padStart(2, "0");
          const updatedTimeSlots = [...props.timeSlots];
          updatedTimeSlots[index].end = `${endHours}:${endMinutes}`;
          emit("update:timeSlots", updatedTimeSlots);
        }
      }
      // 時間差が1時間以上の場合は現在の終了時刻を維持
    } else {
      // 現在の終了時刻が無効な場合は+1時間を設定
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1時間

      // 24時間を超える場合は24:00に設定
      if (endTime.getHours() === 0) {
        const updatedTimeSlots = [...props.timeSlots];
        updatedTimeSlots[index].end = "24:00";
        emit("update:timeSlots", updatedTimeSlots);
      } else {
        const endHours = endTime.getHours().toString().padStart(2, "0");
        const endMinutes = endTime.getMinutes().toString().padStart(2, "0");
        const updatedTimeSlots = [...props.timeSlots];
        updatedTimeSlots[index].end = `${endHours}:${endMinutes}`;
        emit("update:timeSlots", updatedTimeSlots);
      }
    }
  }

  emit("startTimeChange", { newStartTime, index });
};

const handleEndTimeChange = (newEndTime, index) => {
  // 終了時刻が変更された時の処理
  emit("endTimeChange", { newEndTime, index });
};
</script>
