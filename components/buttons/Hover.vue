<template>
  <button @click="$emit('click')" :class="buttonClasses">
    <UIcon :name="name" :class="iconClasses" :style="iconStyle" />
  </button>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  // UIcon、divのpaddingのサイズの指定。1~10の数値
  size: {
    type: Number,
    default: 5,
    validator: (value) => value >= 1 && value <= 10,
  },
  // UIconに適用するicon名
  name: {
    type: String,
    required: true,
  },
  // ホバー時に適用するカラー。「bg-blue-500」などのtailwindcssのバックグラウンドの際の関数を直接入力できるようにする
  color: {
    type: String,
    default: "bg-gray-600",
  },
  // divにhover:bg-gray-300を適用するかどうか。trueかfalseのみ入力できるようにする
  ishover: {
    type: Boolean,
    default: undefined, // デフォルトでtrueとして扱う
  },
  // 追加のクラス
  class: {
    type: String,
    default: "",
  },
});

defineEmits(["click"]);

const buttonClasses = computed(() => {
  const baseClasses = "flex justify-center items-center rounded-full";
  const hoverClass = props.ishover !== false ? "hover:bg-gray-300" : ""; // デフォルトでtrue

  // sizeに基づいてpaddingを設定（固定値を使用）
  let paddingClass = "";
  if (props.size <= 3) {
    paddingClass = "py-1 px-1";
  } else if (props.size <= 5) {
    paddingClass = "py-1.5 px-1.5";
  } else if (props.size <= 6) {
    paddingClass = "py-2 px-3";
  } else if (props.size <= 7) {
    paddingClass = "py-2.5 px-3";
  } else {
    paddingClass = "py-2.5 px-3";
  }

  return [baseClasses, paddingClass, hoverClass, props.class]
    .filter(Boolean)
    .join(" ");
});

const iconClasses = computed(() => {
  const sizeClass = `size-${props.size}`;
  const baseColorClass = "bg-gray-600"; // ベースカラーは常にgray-600

  return [sizeClass, baseColorClass].filter(Boolean).join(" ");
});

const iconStyle = computed(() => {
  // colorプロパティからTailwindクラスを解析してCSS変数を設定
  const colorMap = {
    "bg-blue-500": "#3b82f6",
    "bg-green-500": "#10b981",
    "bg-red-500": "#ef4444",
    "bg-red-800": "#991b1b",
    "bg-blue-600": "#2563eb",
    "bg-gray-600": "#4b5563",
  };

  const hoverColor = colorMap[props.color] || "#4b5563";

  return {
    "--hover-color": hoverColor,
  };
});
</script>

<style scoped>
button:hover .bg-gray-600 {
  background-color: var(--hover-color) !important;
}
</style>
