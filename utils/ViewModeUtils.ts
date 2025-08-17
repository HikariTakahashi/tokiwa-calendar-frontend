import { ref } from "vue";
import type { Ref } from "vue";

export type ViewMode = "year" | "month" | "week";

export interface ViewModeState {
  viewMode: Ref<ViewMode>;
  setViewMode: (mode: ViewMode) => void;
  isYearView: () => boolean;
  isMonthView: () => boolean;
  isWeekView: () => boolean;
}

/**
 * 表示方法の切り替えロジックを管理するユーティリティ
 * @param initialMode 初期表示方法（デフォルト: 'month'）
 * @returns ViewModeState
 */
export function useViewMode(initialMode: ViewMode = "month"): ViewModeState {
  const viewMode = ref<ViewMode>(initialMode);

  const setViewMode = (mode: ViewMode) => {
    viewMode.value = mode;
  };

  const isYearView = () => viewMode.value === "year";
  const isMonthView = () => viewMode.value === "month";
  const isWeekView = () => viewMode.value === "week";

  return {
    viewMode,
    setViewMode,
    isYearView,
    isMonthView,
    isWeekView,
  };
}

/**
 * 表示方法の変更を処理するハンドラー
 * @param viewModeState ViewModeState
 * @param additionalHandlers 追加のハンドラー（月選択時の処理など）
 * @returns イベントハンドラー
 */
export function createViewModeHandlers(
  viewModeState: ViewModeState,
  additionalHandlers?: {
    onMonthSelected?: (month: number) => void;
  }
) {
  const handleViewModeChanged = (mode: ViewMode) => {
    viewModeState.setViewMode(mode);
  };

  const handleMonthSelected = (month: number) => {
    if (additionalHandlers?.onMonthSelected) {
      additionalHandlers.onMonthSelected(month);
    }
    // 月選択時は月表示に切り替える
    viewModeState.setViewMode("month");
  };

  return {
    handleViewModeChanged,
    handleMonthSelected,
  };
}

/**
 * 表示方法に応じたコンポーネントの条件分岐を生成
 * @param viewModeState ViewModeState
 * @returns 条件分岐オブジェクト
 */
export function getViewModeConditions(viewModeState: ViewModeState) {
  return {
    isYearView: viewModeState.isYearView(),
    isMonthView: viewModeState.isMonthView(),
    isWeekView: viewModeState.isWeekView(),
  };
}
