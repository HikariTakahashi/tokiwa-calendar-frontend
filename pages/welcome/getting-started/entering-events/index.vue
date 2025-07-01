<template>
  <div
    class="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-90 backdrop-blur-sm"
  >
    <welcome-header />
  </div>
  <div class="flex flex-row w-full pt-10">
    <!--ナビゲーション-->
    <NavigationSection />
    <!--コンテンツ-->
    <div
      class="flex flex-col w-5/6 h-screen py-6 sm:px-10 border-l-2 border-gray-200"
    >
      <div class="flex flex-col gap-y-2">
        <h1 class="pl-2 text-3xl sm:text-4xl font-bold">予定の入力</h1>
        <h3 class="pl-4 text-sm text-gray-500">
          このページでは、カレンダーアプリ「Tokiwa
          Calendar」の予定の入力方法を紹介します。
        </h3>
      </div>
      <div class="flex w-full h-0.5 bg-gray-200 my-10" />
      <div class="flex flex-col gap-y-6">
        <h5 class="text-sm text-gray-600">工事中...</h5>
        <!-- <button
          @click="navigateTo('/')"
          class="flex justify-start hover:underline hover:text-blue-700"
        >
          <h4 class="text-2xl font-bold"></h4>
        </button> -->
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
