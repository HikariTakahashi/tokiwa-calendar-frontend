<template>
  <div
    id="about"
    class="flex flex-col h-screen bg-white gap-x-4 pt-24 sm:pt-16"
    style="scroll-snap-align: start; scroll-snap-stop: always"
  >
    <div class="flex flex-col text-center px-3">
      <h2 class="text-3xl sm:text-4xl font-bold">Tokiwa Calendarとは？</h2>

      <h5 class="sm:text-xl pt-5">
        TokiWa
        Calendarは、「部屋を丸ごとリマインダーにする」ことをテーマとした、
        タスク管理特化のカレンダーアプリです。
      </h5>
      <h5 class="sm:text-xl">
        忘れてはならない数々の「タスク」を部屋全体があなたにリマインドします。
      </h5>
    </div>
    <h3 class="text-3xl font-bold pt-10 pl-10">TokiWaの魅力</h3>
    <div class="flex flex-row px-5 pb-10 flex-1">
      <Carousel :items="6">
        <template #default="{ index, activeIndex }">
          <Card
            v-if="index === 0"
            title="日程調整"
            description="チームの日程を、&#10;わかりやすく調整。"
            img="/background-img.png"
            :is-active="index === activeIndex"
            page-transition="/welcome"
          />
          <Card
            v-else-if="index === 1"
            title="コピー＆ペースト"
            description="あなたの時間を、&#10;素早く共有。"
            img="/background-copy-paste.png"
            :is-active="index === activeIndex"
            page-transition="/welcome"
          />
          <Card
            v-else-if="index === 2"
            title="コピーモード"
            description="入力したデータを、&#10;簡単にコピー。"
            img="/background-copymode.png"
            :is-active="index === activeIndex"
            page-transition="/welcome"
          />
          <Card
            v-else-if="index === 3"
            title="タスク管理"
            description="日々のタスクを、&#10;可視化して整理。"
            img="/todolist.jpg"
            :is-active="index === activeIndex"
            page-transition="/task"
          />
          <Card
            v-else-if="index === 4"
            title="リマインド"
            description="部屋全体が、&#10;あなたにリマインド。"
            img="/board.png"
            :is-active="index === activeIndex"
            page-transition="/task"
          />
          <Card
            v-else-if="index === 5"
            title="カスタマイズ"
            description="リマインド方法を、&#10;あなた好みに。"
            :is-active="index === activeIndex"
            page-transition="/task"
          />
        </template>
      </Carousel>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from "~/components/welcome/Card.vue";
import Carousel from "~/components/welcome/Carousel.vue";
</script>
