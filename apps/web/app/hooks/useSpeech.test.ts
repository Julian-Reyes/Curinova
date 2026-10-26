import { describe, expect, it } from 'vitest';
import { pickVoice } from './useSpeech';

const voice = (lang: string, name = lang, localService = true) =>
  ({ lang, name, voiceURI: name, localService, default: false }) as SpeechSynthesisVoice;

describe('pickVoice (§3.7)', () => {
  it('prefers an exact pt-BR voice for Portuguese lessons', () => {
    expect(pickVoice([voice('en-US'), voice('pt-PT'), voice('pt-BR')], 'pt-BR')?.lang).toBe(
      'pt-BR',
    );
  });

  it('accepts another Portuguese voice before giving up', () => {
    expect(pickVoice([voice('en-US'), voice('pt-PT')], 'pt-BR')?.lang).toBe('pt-PT');
  });

  it('never reads Portuguese with an English voice', () => {
    expect(pickVoice([voice('en-US'), voice('en-GB')], 'pt-BR')).toBeUndefined();
  });

  it('honors the saved voice when it matches the locale', () => {
    expect(pickVoice([voice('en-US', 'A'), voice('en-GB', 'B')], 'en', 'B')?.name).toBe('B');
  });
});
