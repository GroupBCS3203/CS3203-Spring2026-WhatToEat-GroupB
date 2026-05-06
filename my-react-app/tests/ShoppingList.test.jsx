import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { ShoppingList } from '../src/ShoppingList.jsx';
import { addSavedRecipe, setSavedRecipes, setUserIngredients } from '../src/varManager.jsx';

// These tests validate the ShoppingList component's ability to build
// an ingredient list from stored recipe data, keep it sorted, remove
// duplicates, and respect the user's existing ingredient inventory.
describe('Shopping List Feature', () => {
  beforeEach(() => {
    // Reset the shared in-memory recipe and user ingredient state
    // before each test runs.
    setSavedRecipes([]);
    setUserIngredients([]);
  });

  // Helper that stores a list of recipes using the same shared API
  // that the component uses, so tests reflect actual app state.
  function saveRecipes(recipes) {
    recipes.forEach(addSavedRecipe);
  }

  it('loads shopping list with deduplicated and sorted ingredients from saved recipes', async () => {
    saveRecipes([
      { _id: '1', title: 'Recipe 1', ingredients: ['apple', 'banana', 'cherry'] },
      { _id: '2', title: 'Recipe 2', ingredients: ['banana', 'date', 'elderberry'] }
    ]);

    render(<ShoppingList recipes={[]} />);

    const generateButton = screen.getByRole('button', { name: /generate/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Recipe 1')).toBeInTheDocument();
      expect(screen.getByText('Recipe 2')).toBeInTheDocument();
      expect(screen.getByText('apple')).toBeInTheDocument();
      expect(screen.getAllByText('banana')).toHaveLength(2); // banana appears in both recipes
      expect(screen.getByText('cherry')).toBeInTheDocument();
      expect(screen.getByText('date')).toBeInTheDocument();
      expect(screen.getByText('elderberry')).toBeInTheDocument();
    });

    // Check that ingredients are grouped under their recipes
    const recipe1Section = screen.getByText('Recipe 1').closest('div');
    const recipe2Section = screen.getByText('Recipe 2').closest('div');

    expect(recipe1Section).toHaveTextContent('apple');
    expect(recipe1Section).toHaveTextContent('banana');
    expect(recipe1Section).toHaveTextContent('cherry');
    expect(recipe2Section).toHaveTextContent('banana');
    expect(recipe2Section).toHaveTextContent('date');
    expect(recipe2Section).toHaveTextContent('elderberry');
  });

  it('handles saved recipes with string ingredients (comma-separated)', async () => {
    saveRecipes([
      { _id: '1', title: 'Recipe 1', ingredients: 'apple, banana, cherry' }
    ]);

    render(<ShoppingList recipes={[]} />);

    const generateButton = screen.getByRole('button', { name: /generate/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Recipe 1')).toBeInTheDocument();
      expect(screen.getByText('apple')).toBeInTheDocument();
      expect(screen.getByText('banana')).toBeInTheDocument();
      expect(screen.getByText('cherry')).toBeInTheDocument();
    });

    // Verify ingredients are under the recipe section
    const recipeSection = screen.getByText('Recipe 1').closest('div');
    expect(recipeSection).toHaveTextContent('apple');
    expect(recipeSection).toHaveTextContent('banana');
    expect(recipeSection).toHaveTextContent('cherry');
  });

  it('deduplicates ingredients within each recipe', async () => {
    saveRecipes([
      { _id: '1', title: 'Recipe 1', ingredients: ['apple', 'banana', 'apple'] },
      { _id: '2', title: 'Recipe 2', ingredients: ['banana', 'cherry', 'banana'] }
    ]);

    render(<ShoppingList recipes={[]} />);

    const generateButton = screen.getByRole('button', { name: /generate/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Recipe 1')).toBeInTheDocument();
      expect(screen.getByText('Recipe 2')).toBeInTheDocument();
    });

    // Check that ingredients are deduplicated within each recipe
    const recipe1Section = screen.getByText('Recipe 1').closest('div');
    const recipe2Section = screen.getByText('Recipe 2').closest('div');

    // Recipe 1 should have apple and banana (deduplicated)
    expect(recipe1Section).toHaveTextContent('apple');
    expect(recipe1Section).toHaveTextContent('banana');

    // Recipe 2 should have banana and cherry (deduplicated)
    expect(recipe2Section).toHaveTextContent('banana');
    expect(recipe2Section).toHaveTextContent('cherry');

    // Count occurrences of each ingredient across all recipes
    const allApples = screen.getAllByText('apple');
    const allBananas = screen.getAllByText('banana');
    const allCherries = screen.getAllByText('cherry');

    expect(allApples).toHaveLength(1); // apple only appears in Recipe 1
    expect(allBananas).toHaveLength(2); // banana appears in both recipes (not deduplicated across recipes)
    expect(allCherries).toHaveLength(1); // cherry only appears in Recipe 2
  });

  it('handles case-insensitive alphabetical sorting within recipes', async () => {
    saveRecipes([
      { _id: '1', title: 'Recipe 1', ingredients: ['Zucchini', 'apple', 'Banana', 'cherry'] }
    ]);

    render(<ShoppingList recipes={[]} />);

    const generateButton = screen.getByRole('button', { name: /generate/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Recipe 1')).toBeInTheDocument();
    });

    // Check that ingredients within the recipe are sorted alphabetically
    const recipeSection = screen.getByText('Recipe 1').closest('div');
    const ingredientSpans = recipeSection.querySelectorAll('span');

    // Find spans that contain ingredient names (not the checkmark spans)
    const ingredientNames = Array.from(ingredientSpans)
      .map(span => span.textContent)
      .filter(text => text && !text.startsWith('✓') && text !== 'Ingredients You Might Need to Buy' && text !== 'Ingredients You May Already Have at Home' && text !== 'Log into an account and load your saved list of ingredients');

    expect(ingredientNames.slice(0, 4)).toEqual(['apple', 'Banana', 'cherry', 'Zucchini']);
  });

  it('excludes ingredients the user already has', async () => {
    saveRecipes([
      { _id: '1', title: 'Recipe 1', ingredients: ['apple', 'banana'] }
    ]);

    render(<ShoppingList recipes={[]} />);
    setUserIngredients([{ id: '1', text: { info: ['banana'] } }]);

    fireEvent.click(screen.getByRole('button', { name: /generate/i }));

    await waitFor(() => {
      expect(screen.getByText('Recipe 1')).toBeInTheDocument();
      expect(screen.getByText('apple')).toBeInTheDocument();
      expect(screen.queryByText('banana')).not.toBeInTheDocument();
    });

    // Verify that only apple appears in the recipe section
    const recipeSection = screen.getByText('Recipe 1').closest('div');
    expect(recipeSection).toHaveTextContent('apple');
    expect(recipeSection).not.toHaveTextContent('banana');
  });

  it('allows toggling shopping list items', async () => {
    saveRecipes([
      { _id: '1', title: 'Recipe 1', ingredients: ['apple', 'banana'] }
    ]);

    render(<ShoppingList recipes={[]} />);

    fireEvent.click(screen.getByRole('button', { name: /generate/i }));

    await waitFor(() => {
      expect(screen.getByText('Recipe 1')).toBeInTheDocument();
      expect(screen.getByText('apple')).toBeInTheDocument();
      expect(screen.getByText('banana')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();

    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();

    fireEvent.click(checkboxes[1]);
    expect(checkboxes[1]).toBeChecked();

    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).not.toBeChecked();
  });

  it('updates shopping list when saved recipes change after rerender', async () => {
    setSavedRecipes([{ _id: '1', title: 'Recipe 1', ingredients: ['apple', 'banana'] }]);
    const { rerender } = render(<ShoppingList recipes={[]} />);

    fireEvent.click(screen.getByRole('button', { name: /generate/i }));

    await waitFor(() => {
      expect(screen.getByText('Recipe 1')).toBeInTheDocument();
      expect(screen.getByText('apple')).toBeInTheDocument();
      expect(screen.getByText('banana')).toBeInTheDocument();
    });

    setSavedRecipes([{ _id: '2', title: 'Recipe 2', ingredients: ['cherry', 'date'] }]);
    rerender(<ShoppingList recipes={[]} />);
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));

    await waitFor(() => {
      expect(screen.getByText('Recipe 2')).toBeInTheDocument();
      expect(screen.getByText('cherry')).toBeInTheDocument();
      expect(screen.getByText('date')).toBeInTheDocument();
      expect(screen.queryByText('Recipe 1')).not.toBeInTheDocument();
      expect(screen.queryByText('apple')).not.toBeInTheDocument();
      expect(screen.queryByText('banana')).not.toBeInTheDocument();
    });
  });

  it('shows empty message when no saved recipes are loaded', async () => {
    render(<ShoppingList recipes={[]} />);

    fireEvent.click(screen.getByRole('button', { name: /generate/i }));

    await waitFor(() => {
      expect(screen.getByText('No ingredients found. You\'ll need to save recipes or add ingredients to get started.')).toBeInTheDocument();
    });
  });

  it('shows helpful message for default placeholder ingredients', async () => {
    // Set default placeholder ingredients
    setUserIngredients([["String", 1, Date.now()]]);
    render(<ShoppingList recipes={[]} />);

    fireEvent.click(screen.getByRole('button', { name: /generate/i }));

    await waitFor(() => {
      expect(screen.getByText('Ingredients You May Already Have at Home')).toBeInTheDocument();
      expect(screen.getByText('Log into an account and load your saved list of ingredients')).toBeInTheDocument();
    });
  });

  it('displays actual stored ingredients when available', async () => {
    render(<ShoppingList recipes={[]} />);
    setUserIngredients([
      { id: '1', text: { info: ['flour', '2 cups', '2026-05-05'] } },
      { id: '2', text: { info: ['eggs', '12', '2026-05-05'] } }
    ]);

    fireEvent.click(screen.getByRole('button', { name: /generate/i }));

    await waitFor(() => {
      expect(screen.getByText('Ingredients You May Already Have at Home')).toBeInTheDocument();
      expect(screen.getByText('✓ flour')).toBeInTheDocument();
      expect(screen.getByText('✓ eggs')).toBeInTheDocument();
      expect(screen.queryByText('Log into an account and load your saved list of ingredients')).not.toBeInTheDocument();
    });
  });
});