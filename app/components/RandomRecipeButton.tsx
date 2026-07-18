interface RandomRecipeButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export default function RandomRecipeButton({ onClick, isLoading }: RandomRecipeButtonProps) {
  return (
    <div className="random-recipe-container">
      <button
        onClick={onClick}
        className="btn btn-primary btn-large"
        disabled={isLoading}
        aria-label="Get a random recipe"
        aria-busy={isLoading}
      >
        {isLoading ? '⏳ Loading...' : '🎲 Random Recipe'}
      </button>
    </div>
  );
}
