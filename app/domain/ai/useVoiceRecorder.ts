'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type RecordingStatus = 'idle' | 'recording' | 'paused';

type UseVoiceRecorderInput = {
  onError: (message: string) => void;
};

type UseVoiceRecorderResult = {
  recordingStatus: RecordingStatus;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  togglePauseRecording: () => void;
};

export const useVoiceRecorder = ({ onError }: UseVoiceRecorderInput): UseVoiceRecorderResult => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');

  const stopRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    mediaRecorderRef.current = null;
    mediaStreamRef.current = null;
    recordedChunksRef.current = [];
    setRecordingStatus('idle');
  }, []);

  const startRecording = useCallback(async () => {
    if (recordingStatus !== 'idle') {
      return;
    }

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      onError('Voice recording is not supported in this browser.');
      return;
    }

    if (!window.MediaRecorder) {
      onError('Voice recording is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaStreamRef.current = stream;
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        }

        mediaRecorderRef.current = null;
        mediaStreamRef.current = null;
        recordedChunksRef.current = [];
        setRecordingStatus('idle');
      };

      mediaRecorder.start();
      setRecordingStatus('recording');
    } catch {
      onError('Unable to access microphone. Please allow microphone permissions.');
      stopRecording();
    }
  }, [onError, recordingStatus, stopRecording]);

  const togglePauseRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;

    if (!mediaRecorder) {
      return;
    }

    if (recordingStatus === 'recording' && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      setRecordingStatus('paused');
      return;
    }

    if (recordingStatus === 'paused' && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      setRecordingStatus('recording');
    }
  }, [recordingStatus]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
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
