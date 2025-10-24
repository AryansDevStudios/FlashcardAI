'use client';

import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

export const AI_VOICES = [
  'Zephyr',
  'Puck',
  'Charon',
  'Kore',
  'Fenrir',
  'Leda',
  'Orus',
  'Aoede',
  'Callirrhoe',
  'Autonoe',
  'Enceladus',
  'Iapetus',
  'Umbriel',
  'Algieba',
  'Despina',
  'Erinome',
  'Algenib',
  'Rasalgethi',
  'Laomedeia',
  'Achernar',
  'Alnilam',
  'Schedar',
  'Gacrux',
  'Pulcherrima',
  'Achird',
  'Zubenelgenubi',
  'Vindemiatrix',
  'Sadachbia',
  'Sadaltager',
  'Sulafat',
];

type VoiceSource = 'browser' | 'ai';

interface TtsSettingsContextType {
  voiceSource: VoiceSource;
  setVoiceSource: (source: VoiceSource) => void;
  aiVoice: string;
  setAiVoice: (voice: string) => void;
}

const TtsSettingsContext = createContext<TtsSettingsContextType | undefined>(
  undefined
);

export const TtsSettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [voiceSource, setVoiceSource] = useLocalStorage<VoiceSource>(
    'flashcard-ai-voice-source',
    'ai'
  );
  const [aiVoice, setAiVoice] = useLocalStorage<string>(
    'flashcard-ai-voice',
    'Algenib'
  );

  return (
    <TtsSettingsContext.Provider
      value={{
        voiceSource,
        setVoiceSource,
        aiVoice,
        setAiVoice,
      }}
    >
      {children}
    </TtsSettingsContext.Provider>
  );
};

export const useTtsSettings = () => {
  const context = useContext(TtsSettingsContext);
  if (context === undefined) {
    throw new Error('useTtsSettings must be used within a TtsSettingsProvider');
  }
  return context;
};
