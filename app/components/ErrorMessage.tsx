interface ErrorMessageProps {
  message: string;
  style?: React.CSSProperties;
}

export default function ErrorMessage({ message, style }: ErrorMessageProps) {
  return (
    <div className="error-message" style={style} role="alert" aria-live="polite" aria-atomic="true">
      {message}
    </div>
  );
}
