
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface AppSettings {
  minimalistMode: boolean;
  syncEnabled: boolean;
  encryptionEnabled: boolean;
  notificationsEnabled: boolean;
}

interface AppSettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  isMinimalistMode: () => boolean;
  setSyncMessageShown: (value: boolean) => void;
  syncMessageShown: boolean;
}

const defaultSettings: AppSettings = {
  minimalistMode: false,
  syncEnabled: true,
  encryptionEnabled: true,
  notificationsEnabled: false,
};

const AppSettingsContext = createContext<AppSettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  isMinimalistMode: () => false,
  setSyncMessageShown: () => {},
  syncMessageShown: true,
});

export const useAppSettings = () => useContext(AppSettingsContext);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [syncMessageShown, setSyncMessageShown] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Load settings from localStorage on initial mount
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
    
    // Load sync message status
    const syncMsgShown = localStorage.getItem('sync_message_shown');
    if (syncMsgShown) {
      setSyncMessageShown(JSON.parse(syncMsgShown));
    }
  }, []);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prevSettings => {
      const updatedSettings = { ...prevSettings, ...newSettings };
      
      // Save updated settings to localStorage
      localStorage.setItem('app_settings', JSON.stringify(updatedSettings));
      
      return updatedSettings;
    });
    
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated",
    });
  };

  const isMinimalistMode = () => settings.minimalistMode;

  const handleSetSyncMessageShown = (value: boolean) => {
    setSyncMessageShown(value);
    localStorage.setItem('sync_message_shown', JSON.stringify(value));
  };

  return (
    <AppSettingsContext.Provider 
      value={{ 
        settings, 
        updateSettings, 
        isMinimalistMode, 
        syncMessageShown, 
        setSyncMessageShown: handleSetSyncMessageShown
      }}
    >
      <div className={settings.minimalistMode ? 'minimalist-mode' : ''}>
        {children}
      </div>
    </AppSettingsContext.Provider>
  );
};
