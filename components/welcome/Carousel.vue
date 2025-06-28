<template>
  <div class="flex flex-col w-full h-full">
    <div class="relative overflow-hidden w-full flex-1 flex items-center">
      <div
        ref="carouselTrack"
        class="flex w-max h-full items-center"
        :style="{ transform: `translateX(${translateX}px)` }"
      >
        <div
          v-for="(_, index) in duplicatedSlots"
          :key="`slot-${index}`"
          class="flex-shrink-0 mr-4 h-full flex items-center"
        >
          <slot :index="index % props.items" :active-index="currentCardIndex" />
        </div>
      </div>
    </div>
    <div class="flex justify-center py-4">
      <ScrollMarker
        :items="props.items"
        :current-index="currentCardIndex"
        @card-click="goToCard"
        ref="scrollMarkerRef"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import ScrollMarker from "./ScrollMarker.vue";

interface Props {
  items: number; // アイテム数を指定
}

const props = defineProps<Props>();

const carouselTrack = ref<HTMLElement>();
const translateX = ref(0);
const cardWidth = 320; // w-80 = 320px
const gap = 16; // gap-x-4 = 16px
const totalCardWidth = cardWidth + gap;
let animationId: number;
let isPaused = ref(false);
let pauseTimeout: number | null = null;
let currentCardIndex = ref(0);

// スロットを2セット分複製（無限ループ用）
const duplicatedSlots = computed(() => Array(props.items * 2).fill(null));

const animate = () => {
  if (isPaused.value) {
    animationId = requestAnimationFrame(animate);
    return;
  }

  translateX.value -= 0.5; // 0.5pxずつ左に移動（より滑らかに）

  // 現在のカードインデックスを更新
  const absoluteIndex = Math.abs(Math.floor(translateX.value / totalCardWidth));
  currentCardIndex.value = absoluteIndex % props.items;

  // 1セット分移動したら位置をリセット
  if (Math.abs(translateX.value) >= props.items * totalCardWidth) {
    translateX.value = 0;
  }

  animationId = requestAnimationFrame(animate);
};

const goToCard = (targetIndex: number) => {
  // アニメーションを停止
  isPaused.value = true;

  // 目標位置を計算
  const targetPosition = -(targetIndex * totalCardWidth);

  // スムーズに移動
  const startPosition = translateX.value;
  const distance = targetPosition - startPosition;
  const duration = 500; // 500ms
  const startTime = Date.now();

  const animateToPosition = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // イージング関数（ease-out）
    const easeOut = 1 - Math.pow(1 - progress, 3);

    translateX.value = startPosition + distance * easeOut;

    if (progress < 1) {
      requestAnimationFrame(animateToPosition);
    } else {
      // 移動完了後、3秒後にアニメーション再開
      if (pauseTimeout) {
        clearTimeout(pauseTimeout);
      }
      pauseTimeout = window.setTimeout(() => {
        isPaused.value = false;
        currentCardIndex.value = targetIndex;
      }, 3000);
    }
  };

  animateToPosition();
};

onMounted(() => {
  // アニメーション開始
  animationId = requestAnimationFrame(animate);
});

onUnmounted(() => {
  // アニメーション停止
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  if (pauseTimeout) {
    clearTimeout(pauseTimeout);
  }
});
</script>
