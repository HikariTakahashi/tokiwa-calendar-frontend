import { ref } from 'vue';

export const useCopyLogic = () => {
  const copiedTimeData = ref(null);
  const isCopyMode = ref(false);

  const handleCopy = (selectedDate: string, timeData: Record<string, any>) => {
    if (selectedDate) {
      copiedTimeData.value = timeData[selectedDate] || null;
    }
    isCopyMode.value = true;
    return {
      isCopyMode: isCopyMode.value,
      copiedTimeData: copiedTimeData.value
    };
  };

  const handlePaste = (date: string, timeData: Record<string, any>) => {
    if (isCopyMode.value && copiedTimeData.value) {
      timeData[date] = copiedTimeData.value;
      return {
        timeData: { ...timeData },
        isPasted: true
      };
    }
    return {
      timeData,
      isPasted: false
    };
  };

  const handleCancelCopyMode = (timeData: Record<string, any>) => {
    if (copiedTimeData.value) {
      Object.keys(timeData).forEach(date => {
        if (timeData[date] === copiedTimeData.value) {
          delete timeData[date];
        }
      });
    }
    copiedTimeData.value = null;
    isCopyMode.value = false;
    return {
      timeData: { ...timeData },
      isCopyMode: false
    };
  };

  const closeCopyMode = () => {
    isCopyMode.value = false;
    return {
      isCopyMode: false
    };
  };

  return {
    copiedTimeData,
    isCopyMode,
    handleCopy,
    handlePaste,
    handleCancelCopyMode,
    closeCopyMode
  };
}; 