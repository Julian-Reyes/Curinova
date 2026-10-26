import type { Locale } from '@lumen/domain';
import { useCallback, useEffect, useRef, useState } from 'react';

export type SpeechState = 'idle' | 'speaking' | 'paused';
export type SpeechAvailability = 'unsupported' | 'no-voice' | 'ready';

/** Picks a voice for the lesson locale: exact match first, then same language (pt-PT for pt-BR). */
export function pickVoice(
  voices: readonly SpeechSynthesisVoice[],
  locale: Locale,
  preferredURI?: string,
): SpeechSynthesisVoice | undefined {
  const lang = (v: SpeechSynthesisVoice) => v.lang.replace('_', '-').toLowerCase();
  const target = locale.toLowerCase();
  const base = target.split('-')[0] ?? target;
  const candidates = voices.filter(
    (v) => lang(v) === target || lang(v).startsWith(`${base}-`) || lang(v) === base,
  );
  return (
    candidates.find((v) => v.voiceURI === preferredURI) ??
    candidates.find((v) => lang(v) === target && v.localService) ??
    candidates.find((v) => lang(v) === target) ??
    candidates[0]
  );
}

/**
 * Device text-to-speech (§3.7). Starts only on a user action, never reads a lesson
 * with a voice of the wrong language, and stops when `key` (the lesson) changes or
 * the component unmounts.
 */
export function useSpeech(locale: Locale, rate: number, key: string, preferredURI?: string) {
  const synth =
    typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis
      : undefined;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => synth?.getVoices() ?? []);
  const [state, setState] = useState<SpeechState>('idle');
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!synth) return;
    const update = () => {
      setVoices(synth.getVoices());
    };
    update();
    synth.addEventListener('voiceschanged', update);
    return () => {
      synth.removeEventListener('voiceschanged', update);
    };
  }, [synth]);

  const stop = useCallback(() => {
    if (!synth) return;
    utterance.current = null;
    synth.cancel();
    setState('idle');
  }, [synth]);

  // Stop when the lesson changes or on unmount.
  useEffect(() => stop, [key, stop]);

  const voice = pickVoice(voices, locale, preferredURI);
  const availability: SpeechAvailability = !synth ? 'unsupported' : voice ? 'ready' : 'no-voice';

  const play = useCallback(
    (text: string) => {
      if (!synth || !voice) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = voice.lang;
      u.voice = voice;
      u.rate = rate;
      u.onend = () => {
        if (utterance.current === u) setState('idle');
      };
      u.onerror = () => {
        if (utterance.current === u) setState('idle');
      };
      utterance.current = u;
      synth.speak(u);
      setState('speaking');
    },
    [synth, voice, rate],
  );

  const pause = useCallback(() => {
    synth?.pause();
    setState('paused');
  }, [synth]);
  const resume = useCallback(() => {
    synth?.resume();
    setState('speaking');
  }, [synth]);

  return { availability, state, play, pause, resume, stop, voiceName: voice?.name };
}
