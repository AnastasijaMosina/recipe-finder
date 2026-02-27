interface DetailedSearchButtonProps {
  onClick: () => void;
}

export default function DetailedSearchButton({ onClick }: DetailedSearchButtonProps) {
  return (
    <div className="detailed-search-container">
      <button onClick={onClick} className="btn btn-primary btn-regular">
        Need more detailed search →
      </button>
    </div>
  );
}
