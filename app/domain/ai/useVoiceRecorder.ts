'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  buildCombinedTranscript,
  getSpeechRecognitionConstructor,
  type SpeechRecognitionLike,
} from './speechRecognitionUtils';

export type RecordingStatus = 'idle' | 'recording' | 'paused';

type UseVoiceRecorderInput = {
  onError: (message: string) => void;
  onTranscriptChange: (transcript: string) => void;
};

type UseVoiceRecorderResult = {
  recordingStatus: RecordingStatus;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  togglePauseRecording: () => void;
};

export const useVoiceRecorder = ({
  onError,
  onTranscriptChange,
}: UseVoiceRecorderInput): UseVoiceRecorderResult => {
  const speechRecognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onErrorRef = useRef(onError);
  const onTranscriptChangeRef = useRef(onTranscriptChange);
  const transcriptRef = useRef('');
  const pauseRequestedRef = useRef(false);
  const stopRequestedRef = useRef(false);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onTranscriptChangeRef.current = onTranscriptChange;
  }, [onTranscriptChange]);

  const startRecognitionSession = useCallback(() => {
    const SpeechRecognitionImpl = getSpeechRecognitionConstructor();

    if (!SpeechRecognitionImpl) {
      onErrorRef.current('Voice recording is not supported in this browser.');
      return false;
    }

    const speechRecognition = new SpeechRecognitionImpl();
    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;
    speechRecognition.lang = 'en-US';
    speechRecognition.maxAlternatives = 1;

    speechRecognition.onresult = (event: Event) => {
      const speechEvent = event as SpeechRecognitionEvent;
      let interimTranscript = '';

      for (let index = speechEvent.resultIndex; index < speechEvent.results.length; index += 1) {
        const result = speechEvent.results[index];
        const transcript = result[0]?.transcript ?? '';

        if (result.isFinal) {
          transcriptRef.current = `${transcriptRef.current} ${transcript}`.trim();
        } else {
          interimTranscript += transcript;
        }
      }

      const combinedTranscript = buildCombinedTranscript(transcriptRef.current, interimTranscript);
      onTranscriptChangeRef.current(combinedTranscript);
    };

    speechRecognition.onend = () => {
      speechRecognitionRef.current = null;

      if (stopRequestedRef.current) {
        stopRequestedRef.current = false;
        transcriptRef.current = '';
        setRecordingStatus('idle');
        return;
      }

      if (pauseRequestedRef.current) {
        pauseRequestedRef.current = false;
        setRecordingStatus('paused');
        return;
      }

      setRecordingStatus('idle');
    };

    speechRecognition.onerror = () => {
      onErrorRef.current('Unable to recognize speech. Please try again.');
      stopRequestedRef.current = true;
      pauseRequestedRef.current = false;
      speechRecognition.stop();
    };

    speechRecognitionRef.current = speechRecognition;
    speechRecognition.start();
    return true;
  }, []);

  const stopRecording = useCallback(() => {
    const speechRecognition = speechRecognitionRef.current;

    if (speechRecognition) {
      stopRequestedRef.current = true;
      pauseRequestedRef.current = false;
      speechRecognition.stop();
    }

    speechRecognitionRef.current = null;
    setRecordingStatus('idle');
  }, []);

  const startRecording = useCallback(async () => {
    if (recordingStatus !== 'idle') {
      return;
    }

    try {
      transcriptRef.current = '';
      pauseRequestedRef.current = false;
      stopRequestedRef.current = false;

      const started = startRecognitionSession();

      if (!started) {
        return;
      }

      setRecordingStatus('recording');
    } catch {
      onErrorRef.current('Unable to access microphone. Please allow microphone permissions.');
      stopRecording();
    }
  }, [recordingStatus, startRecognitionSession, stopRecording]);

  const togglePauseRecording = useCallback(() => {
    if (recordingStatus === 'recording') {
      const speechRecognition = speechRecognitionRef.current;

      if (!speechRecognition) {
        return;
      }

      pauseRequestedRef.current = true;
      speechRecognition.stop();
      return;
    }

    if (recordingStatus === 'paused') {
      stopRequestedRef.current = false;
      const resumed = startRecognitionSession();

      if (!resumed) {
        return;
      }

      setRecordingStatus('recording');
    }
  }, [recordingStatus, startRecognitionSession]);

  useEffect(() => {
    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, []);

  return {
    recordingStatus,
    startRecording,
    stopRecording,
    togglePauseRecording,
  };
};
