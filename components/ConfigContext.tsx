'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { MultimodalModel, ImageModel } from '@/lib/genai/types';

interface ConfigContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  selectedModel: MultimodalModel;
  setSelectedModel: (model: MultimodalModel) => void;
  selectedImageModel: ImageModel;
  setSelectedImageModel: (model: ImageModel) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<MultimodalModel>(MultimodalModel.DEFAULT);
  const [selectedImageModel, setSelectedImageModel] = useState<ImageModel>(ImageModel.DEFAULT);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const value = useMemo(() => ({
    apiKey,
    setApiKey,
    selectedModel,
    setSelectedModel,
    selectedImageModel,
    setSelectedImageModel,
    isSettingsOpen,
    setIsSettingsOpen
  }), [apiKey, selectedModel, selectedImageModel, isSettingsOpen]);

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
