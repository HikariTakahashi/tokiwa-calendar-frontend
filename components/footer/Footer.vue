<template>
  <div class="flex flex-col w-screen h-52 sm:h-36 bg-gray-100">
    <div class="flex flex-col sm:flex-row py-5 px-8 sm:px-16">
      <div class="flex flex-col pb-5 sm:pb-0 sm:mr-20">
        <Title />
        <p class="text-sm text-center sm:text-left text-gray-500">
          「部屋を丸ごとリマインダーにする」
        </p>
        <p class="text-sm text-center sm:text-left text-gray-500">
          タスク管理に特化したカレンダーアプリ
        </p>
      </div>
      <div class="flex flex-row gap-x-12">
        <div class="flex flex-col gap-y-2 items-start">
          <button @click="navigateTo('/welcome')">
            <h5 class="text-sm text-gray-500 hover:underline">
              Tokiwa Calendar
            </h5>
          </button>
          <button @click="navigateTo('/welcome/getting-started')">
            <h5 class="text-sm text-gray-500 hover:underline">Get Started</h5>
          </button>
        </div>
        <div class="flex flex-col gap-y-2 items-start">
          <button @click="navigateTo('/')">
            <h5 class="text-sm text-gray-500 hover:underline">
              予定調整モード
            </h5>
          </button>
          <button @click="navigateTo('/task')">
            <h5 class="text-sm text-gray-500 hover:underline">
              タスク管理モード
            </h5>
          </button>
        </div>
        <div class="flex flex-col gap-y-2 items-start">
          <button @click="navigateTo('/terms')">
            <h5 class="text-sm text-gray-500 hover:underline">
              利用規約・プライバシーポリシー
            </h5>
          </button>
        </div>
      </div>
    </div>
    <div class="flex justify-center pb-2 text-gray-500">
      <h5 class="text-sm">Copyright © 2025 Project Tokiwa Calendar</h5>
    </div>
  </div>
</template>

<script setup lang="ts">
import Title from "@/components/calendar/Title.vue";
</script>
