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
    <div class="flex flex-col w-5/6 py-6 sm:px-10 border-l-2 border-gray-200">
      <div class="flex flex-col gap-y-2">
        <h1 class="pl-2 text-3xl sm:text-4xl font-bold">Introduction</h1>
        <h3 class="pl-4 text-sm text-gray-500">
          このページでは、カレンダーアプリ「Tokiwa
          Calendar」の使い方を紹介します。
        </h3>
      </div>
      <div class="flex w-full h-0.5 bg-gray-200 my-10" />
      <div class="flex flex-col gap-y-6">
        <h5 class="text-sm text-gray-600">
          TokiWa
          Calendarは「部屋を丸ごとリマインダーにする」ことをテーマとした、
          タスク管理特化のカレンダーアプリです。忘れてはならない数々の「タスク」を部屋全体があなたにリマインドします。
        </h5>
        <h5 class="text-sm text-gray-600">
          あなたは、課題やオンラインMTGなどの重要なタスクを忘れてしまったことはありませんか？そんな出来事を起こさせないように私たちはこのカレンダーアプリを制作しました。
        </h5>
        <h5 class="text-sm text-gray-600 whitespace-pre-wrap">
          例えば、あなたが重要なタスクを忘れて電気を消し、眠りについてしまった場合、TokiWaはそれを検知し、アラームを鳴らし、電気をつけてあなたを起こします。&#10;
          .例えば、あなたがタスクの処理を怠ってSNSやゲームに没頭した場合、TokiWaはそれを検知し、音を鳴らし、電気を消してあなたの活動を妨害します。
        </h5>
        <h5 class="text-sm text-gray-600">
          ときには優しく、ときには厳しく、TokiWaはあなたのタスク管理をサポートします。
        </h5>
        <button
          id="schedule-adjust"
          @click="navigateTo('/')"
          class="flex justify-start hover:underline hover:text-blue-700"
        >
          <button
            @click="navigateTo('/')"
            class="flex justify-start hover:underline hover:text-blue-700"
          >
            <h4 class="text-2xl font-bold">日程調整</h4>
          </button>
        </button>
        <h5 class="text-sm text-gray-600">
          あなたは、遊びに行く、プロジェクトを進める、あるいはオンラインでの重要な会議をを行うとき、どのように日程を調整しますか？
        </h5>
        <h5 class="text-sm text-gray-600">
          TokiWaの日程調整モードは、日程調整をサポートするためのモードです。
        </h5>
        <h5 class="text-sm text-gray-600">
          Tokiwaの日程調整モードはユーザーの使いやすさを重視したカレンダースタイルのわかりやすいインターフェースを実現し、希望する時間の入力を簡単に行うことができます。
        </h5>
        <h5 class="text-sm text-gray-600">
          入力したあなたの日程は、同期ボタンでオンライン上に反映、URLを発行します。あなただけのURLを知っていれば世界中のどこにいても、誰もがあなたの日程を確認することができます。
        </h5>
        <h5 class="text-sm text-gray-600">
          また、そのカレンダーを用いれば、メンバー全体の日程の確認が可能です。メンバーの動ける時間を一元管理し、キックオフMTGやタスク管理など、あらゆるプロジェクトの進行をサポートします。
        </h5>
        <button
          id="task-management"
          @click="navigateTo('/task')"
          class="flex justify-start hover:underline hover:text-blue-700"
        >
          <h4 class="text-2xl font-bold">タスク管理</h4>
        </button>
        <h5 class="flex py-10 text-4xl font-bold font-mono">Coming Soon...</h5>
        <h5 class="text-sm text-gray-600">
          タスク管理モードは、2025.08.28にリリース予定です。
        </h5>
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
