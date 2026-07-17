import type { RecordingStatus } from '../domain/ai/useVoiceRecorder';

type VoiceRecorderControlsProps = {
  recordingStatus: RecordingStatus;
  disabled: boolean;
  onStartRecording: () => void;
  onTogglePauseRecording: () => void;
  onStopRecording: () => void;
};

const VoiceRecorderControls = ({
  recordingStatus,
  disabled,
  onStartRecording,
  onTogglePauseRecording,
  onStopRecording,
}: VoiceRecorderControlsProps) => {
  const isRecording = recordingStatus === 'recording';
  const primaryButtonLabel = isRecording ? '' : '🎙️';
  const primaryButtonAriaLabel = isRecording ? 'Recording in progress' : 'Start voice recording';

  return (
    <>
      <button
        type="button"
        className={`btn btn-secondary btn-medium ai-voice-toggle ${isRecording ? 'is-recording' : ''}`}
        onClick={onStartRecording}
        disabled={disabled || recordingStatus !== 'idle'}
        aria-label={primaryButtonAriaLabel}
      >
        {isRecording && <span className="ai-recording-icon" aria-hidden="true" />}
        {primaryButtonLabel}
      </button>

      {recordingStatus !== 'idle' && (
        <div className="ai-recording-controls" aria-label="Recording controls">
          <button
            type="button"
            className="btn btn-secondary btn-medium"
            onClick={onTogglePauseRecording}
            disabled={disabled}
          >
            {recordingStatus === 'paused' ? '▶️' : '⏸️'}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-medium"
            onClick={onStopRecording}
            disabled={disabled}
          >
            ⏹️
          </button>
        </div>
      )}
    </>
  );
};

export default VoiceRecorderControls;
