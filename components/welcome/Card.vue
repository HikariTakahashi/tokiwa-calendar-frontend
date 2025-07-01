<template>
  <div
    class="flex flex-col p-5 flex-shrink-0 transition-all duration-300 shadow-md bg-gray-900 rounded-3xl relative overflow-hidden"
    :class="isActive ? ' w-96 h-full' : 'w-80 h-[95%] '"
    :style="backgroundStyle"
  >
    <div v-if="img" class="absolute inset-0 bg-black bg-opacity-50 z-0"></div>
    <div class="relative z-10 flex flex-col h-full">
      <h4 class="text-4xl font-bold text-white pb-5">{{ title }}</h4>
      <div class="text-2xl text-white whitespace-pre-wrap flex-1">
        {{ description }}
      </div>
      <div class="flex justify-end">
        <buttons-circle @click="handlePageTransition">
          <UIcon
            name="ic:baseline-arrow-forward-ios"
            class="size-6 text-white hover:text-gray-600"
          />
        </buttons-circle>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  title: string;
  description: string;
  isActive?: boolean;
  pageTransition: string;
  img?: string;
}

const props = defineProps<Props>();

// 背景スタイルを計算
const backgroundStyle = computed(() => {
  if (props.img) {
    return {
      backgroundImage: `url(${props.img})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  }
  return {};
});

const handlePageTransition = () => {
  // pageTransitionからハッシュ部分を抽出してセクションIDを取得
  const hashIndex = props.pageTransition.indexOf("#");
  if (hashIndex !== -1) {
    const sectionId = props.pageTransition.substring(hashIndex + 1);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }
  }

  // セクションが見つからない場合は従来のページ遷移
  navigateTo(props.pageTransition);
};
</script>
