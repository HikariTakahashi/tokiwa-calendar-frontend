<template>
  <div
    class="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-90 backdrop-blur-sm"
  >
    <welcome-header />
  </div>
  <div class="flex flex-row w-full pt-10">
    <NavigationSection />
    <div
      class="flex flex-col w-5/6 h-auto min-h-screen py-12 sm:px-16 border-l-2 border-gray-200"
    >
      <div class="flex flex-col gap-y-2">
        <h1 class="text-3xl sm:text-4xl font-bold">Introduction</h1>
        <p class="text-sm text-gray-500">
          このページでは、カレンダーアプリ「TokiWa
          Calendar」の使い方を紹介します。
        </p>
      </div>

      <div class="w-full h-0.5 bg-gray-200 my-12" />

      <div class="flex flex-col gap-y-16">
        <div class="flex flex-col gap-y-4">
          <div class="flex flex-row items-center gap-x-4">
            <span class="text-4xl font-bold text-blue-800">01</span>
            <h2 class="text-3xl font-bold">日程調整</h2>
          </div>
          <div class="flex flex-col pl-14 gap-y-5">
            <h3 class="text-xl font-semibold">チームの予定も、これ一つで</h3>
            <div class="w-full h-[1px] bg-gray-400" />
            <p class="text-base text-gray-700 leading-relaxed">
              Tokia
              Calendarは、個人からチームまで、あらゆる日程調整をスムーズにするためのアプリです。あなたの空き時間を共有URLとして発行し、簡単なスケジュール調整を実現します。さらにチームで利用すれば、メンバーの予定も一元管理が可能です。
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-y-4">
          <div class="flex flex-row items-center gap-x-4">
            <span class="text-4xl font-bold text-blue-800">02</span>
            <h2 class="text-3xl font-bold">タスク管理</h2>
          </div>
          <div class="flex flex-col pl-14 gap-y-5">
            <div class="w-full h-[1px] bg-gray-400" />
            <div
              class="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-12 mt-4"
            >
              <h4 class="text-4xl font-bold text-gray-400">Coming Soon...</h4>
              <p class="text-sm text-gray-500 mt-2">
                タスク管理モードは、2025.08.28にリリース予定です。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script setup lang="ts">
import WelcomeHeader from "~/components/header/WelcomeHeader.vue";
import Footer from "~/components/footer/Footer.vue";
import NavigationSection from "~/components/welcome/sections/NavigationSection.vue";
</script>
