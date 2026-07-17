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
  return (
    <>
      <button
        type="button"
        className={`btn btn-secondary btn-medium ai-voice-toggle ${recordingStatus !== 'idle' ? 'is-recording' : ''}`}
        onClick={onStartRecording}
        disabled={disabled || recordingStatus !== 'idle'}
        aria-label={recordingStatus === 'idle' ? 'Start voice recording' : 'Recording in progress'}
      >
        <span
          className={recordingStatus === 'idle' ? 'ai-mic-icon' : 'ai-recording-icon'}
          aria-hidden="true"
        />
        {recordingStatus === 'idle' ? 'Mic' : 'Recording'}
      </button>

      {recordingStatus !== 'idle' && (
        <div className="ai-recording-controls" aria-label="Recording controls">
          <button
            type="button"
            className="btn btn-secondary btn-medium"
            onClick={onTogglePauseRecording}
            disabled={disabled}
          >
            {recordingStatus === 'paused' ? 'Continue' : 'Pause'}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-medium"
            onClick={onStopRecording}
            disabled={disabled}
          >
            Stop
          </button>
        </div>
      )}
    </>
  );
};

export default VoiceRecorderControls;
