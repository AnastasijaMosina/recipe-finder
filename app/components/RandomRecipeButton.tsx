interface RandomRecipeButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export default function RandomRecipeButton({ onClick, isLoading }: RandomRecipeButtonProps) {
  return (
    <div className="random-recipe-container">
      <button
        type="button"
        onClick={onClick}
        className="btn btn-primary btn-large"
        disabled={isLoading}
        aria-label={isLoading ? 'Loading a random recipe' : 'Get a random recipe'}
      >
        {isLoading ? '⏳ Loading...' : '🎲 Random Recipe'}
      </button>
    </div>
  );
}
