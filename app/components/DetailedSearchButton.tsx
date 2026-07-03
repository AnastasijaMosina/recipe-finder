interface DetailedSearchButtonProps {
  onClick: () => void;
}

export default function DetailedSearchButton({ onClick }: DetailedSearchButtonProps) {
  return (
    <div className="detailed-search-container">
      <button
        type="button"
        onClick={onClick}
        className="btn btn-primary btn-regular"
        aria-label="Open detailed recipe search"
      >
        Need more detailed search →
      </button>
    </div>
  );
}
