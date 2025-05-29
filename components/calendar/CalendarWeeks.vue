<template>
  <div class="grid grid-cols-7 justify-center gap-1 sm:gap-2">
    <!-- 開始曜日・表示形式を変更できるよう将来的に変更 -->
    <div
      v-for="week in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
      :key="week"
      class="flex justify-center font-bold"
    >
      {{ week }}
    </div>
  </div>
</template>
