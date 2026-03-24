import { useSMTPStore } from '../store/smtpStore';

export const useSMTP = () => {
  const {
    smtpConfigs,
    selectedConfig,
    isLoading,
    error,
    initializeSMTPConfigs,
    addSMTPConfig,
    updateSMTPConfig,
    deleteSMTPConfig,
    setSelectedConfig,
    getDefaultSMTPConfig,
  } = useSMTPStore();

  return {
    smtpConfigs,
    selectedConfig,
    isLoading,
    error,
    initializeSMTPConfigs,
    addSMTPConfig,
    updateSMTPConfig,
    deleteSMTPConfig,
    setSelectedConfig,
    getDefaultSMTPConfig,
  };
};
