import { ref } from 'vue';

export const useCopyLogic = () => {
  const copiedTimeData = ref(null);
  const isCopyMode = ref(false);
  const pastedDates = ref<Set<string>>(new Set());
  const originalData = ref<Record<string, any>>({});

  const handleCopy = (selectedDate: string, timeData: Record<string, any>) => {
    if (selectedDate) {
      copiedTimeData.value = timeData[selectedDate] || null;
    }
    isCopyMode.value = true;
    pastedDates.value.clear();
    originalData.value = {};
    return {
      isCopyMode: isCopyMode.value,
      copiedTimeData: copiedTimeData.value
    };
  };

  const handlePaste = (date: string, timeData: Record<string, any>) => {
    if (isCopyMode.value && copiedTimeData.value) {
      if (pastedDates.value.has(date)) {
        if (originalData.value[date]) {
          timeData[date] = originalData.value[date];
        } else {
          delete timeData[date];
        }
        pastedDates.value.delete(date);
        return {
          timeData: { ...timeData },
          isPasted: false,
          isCancelled: true
        };
      }
      
      if (timeData[date]) {
        originalData.value[date] = timeData[date];
      }
      
      timeData[date] = copiedTimeData.value;
      pastedDates.value.add(date);
      return {
        timeData: { ...timeData },
        isPasted: true,
        isCancelled: false
      };
    }
    return {
      timeData,
      isPasted: false,
      isCancelled: false
    };
  };

  const handleCancelCopyMode = (timeData: Record<string, any>) => {
    if (copiedTimeData.value) {
      Object.keys(timeData).forEach(date => {
        if (timeData[date] === copiedTimeData.value) {
          if (originalData.value[date]) {
            timeData[date] = originalData.value[date];
          } else {
            delete timeData[date];
          }
        }
      });
    }
    copiedTimeData.value = null;
    isCopyMode.value = false;
    pastedDates.value.clear();
    originalData.value = {};
    return {
      timeData: { ...timeData },
      isCopyMode: false
    };
  };

  const closeCopyMode = () => {
    isCopyMode.value = false;
    pastedDates.value.clear();
    originalData.value = {};
    return {
      isCopyMode: false
    };
  };

  return {
    copiedTimeData,
    isCopyMode,
    pastedDates,
    originalData,
    handleCopy,
    handlePaste,
    handleCancelCopyMode,
    closeCopyMode
  };
}; 