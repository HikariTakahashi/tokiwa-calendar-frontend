<template>
  <Feature
    id="schedule-adjust"
    title="日程調整"
    description="Tokiwaの日程調整機能で、チームのスケジュール管理をもっとスムーズに。&#10;入力した日程を同期ボタンでカレンダーに反映。作成したカレンダーはURL共有で誰でも閲覧できます。&#10;新しいカレンダーを作れば、チーム専用のURLが生成され、メンバー全体で日程調整が可能です。メンバーの動ける時間を一元管理し、キックオフMTGやタスク管理など、あらゆるプロジェクトの進行をサポートします。"
    url="/welcome/getting-started"
    src="/schedule-adjust.png"
  />
  <Feature
    id="copy-and-paste"
    title="コピー＆ペースト"
    description="カレンダーデータをスクリプトで手軽にコピー。&#10;「今月の空き時間どこ？」といった急な共有も瞬時に対応できます。&#10;コピーしたデータは、他のツールや資料への貼り付けにも活用でき、プロジェクトの進捗報告やイベントの日程調整など、幅広いシーンで利用可能です。"
    url="/welcome/getting-started"
    src="/copy-and-paste.png"
  />
  <Feature
    id="copy-mode"
    title="コピーモード"
    description="一度登録した予定や空き時間を、コピーモードでワンタップ複製。&#10;一度作れば、「〜終日OK」など同じ内容も、複数の日付にペースト可能。&#10;繰り返しの入力手間を省き、カレンダー作成を大幅に効率化します。"
    url="/welcome/getting-started"
    src="/copy-mode.png"
  />
  <Feature
    id="task-management"
    title="タスク管理"
    description="ToDoアプリにタスクを入力すると、期日とともにカレンダーへ自動反映。&#10;あなたの「やるべきこと」を一目で把握し、抜け漏れなく計画的にプロジェクトを進められます。"
    url="/task"
    src="/todolist.jpg"
  />
  <Feature
    id="reminder"
    title="リマインド"
    description="期日ごとにスマートフォンへの通知や、ハードウェア連携によるリマインドが可能です。&#10;多彩なリマインド機能で、タスクの遅延を防ぎ、プロジェクトの進行を強力にサポートします。"
    url="/task"
    src="/board.png"
  />
  <Feature
    id="customization"
    title="カスタマイズ"
    description="タスクの細分化に合わせたこまめなリマインド設定をできるほか、通知権限やハードウェアの種類に応じた柔軟なカスタマイズが可能です。&#10;あなたのワークフローに最適なリマインド環境を構築し、効率的なタスク管理を提供します。"
    url="/task"
    src="/board.png"
  />

  <!-- Footerの高さ分の余白を追加 -->
  <div class="h-36"></div>
</template>

<script setup lang="ts">
import Feature from "../Feature.vue";
</script>
