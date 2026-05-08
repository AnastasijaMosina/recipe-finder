interface DetailedSearchButtonProps {
  onClick: () => void;
}

export default function DetailedSearchButton({ onClick }: DetailedSearchButtonProps) {
  return (
    <div className="detailed-search-container">
      <button
        onClick={onClick}
        className="btn btn-primary btn-regular"
        aria-label="Open detailed search form with more filtering options"
      >
        Need more detailed search →
      </button>
    </div>
  );
}
