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
      expect(screen.getByText('apple')).toBeInTheDocument();
      expect(screen.getByText('banana')).toBeInTheDocument();
      expect(screen.getByText('cherry')).toBeInTheDocument();
      expect(screen.getByText('date')).toBeInTheDocument();
      expect(screen.getByText('elderberry')).toBeInTheDocument();
    });

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(5);
    expect(listItems[0]).toHaveTextContent('apple');
    expect(listItems[1]).toHaveTextContent('banana');
    expect(listItems[2]).toHaveTextContent('cherry');
    expect(listItems[3]).toHaveTextContent('date');
    expect(listItems[4]).toHaveTextContent('elderberry');
  });

  it('handles saved recipes with string ingredients (comma-separated)', async () => {
    saveRecipes([
      { _id: '1', title: 'Recipe 1', ingredients: 'apple, banana, cherry' }
    ]);

    render(<ShoppingList recipes={[]} />);

    const generateButton = screen.getByRole('button', { name: /generate/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('apple')).toBeInTheDocument();
      expect(screen.getByText('banana')).toBeInTheDocument();
      expect(screen.getByText('cherry')).toBeInTheDocument();
    });
  });

  it('deduplicates ingredients across saved recipes', async () => {
    saveRecipes([
      { _id: '1', title: 'Recipe 1', ingredients: ['apple', 'banana'] },
      { _id: '2', title: 'Recipe 2', ingredients: ['banana', 'cherry'] },
      { _id: '3', title: 'Recipe 3', ingredients: ['apple', 'cherry', 'date'] }
    ]);

    render(<ShoppingList recipes={[]} />);

    const generateButton = screen.getByRole('button', { name: /generate/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('apple')).toBeInTheDocument();
      expect(screen.getByText('banana')).toBeInTheDocument();
      expect(screen.getByText('cherry')).toBeInTheDocument();
      expect(screen.getByText('date')).toBeInTheDocument();
    });

    expect(screen.getAllByText('apple')).toHaveLength(1);
    expect(screen.getAllByText('banana')).toHaveLength(1);
    expect(screen.getAllByText('cherry')).toHaveLength(1);
    expect(screen.getAllByText('date')).toHaveLength(1);
  });

  it('handles case-insensitive alphabetical sorting', async () => {
    saveRecipes([
      { _id: '1', title: 'Recipe 1', ingredients: ['Zucchini', 'apple', 'Banana', 'cherry'] }
    ]);

    render(<ShoppingList recipes={[]} />);

    const generateButton = screen.getByRole('button', { name: /generate/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(4);
      expect(listItems[0]).toHaveTextContent('apple');
      expect(listItems[1]).toHaveTextContent('Banana');
      expect(listItems[2]).toHaveTextContent('cherry');
      expect(listItems[3]).toHaveTextContent('Zucchini');
    });
  });

  it('excludes ingredients the user already has', async () => {
    saveRecipes([
      { _id: '1', title: 'Recipe 1', ingredients: ['apple', 'banana'] }
    ]);
    setUserIngredients([{ id: '1', text: { info: ['banana'] } }]);

    render(<ShoppingList recipes={[]} />);

    fireEvent.click(screen.getByRole('button', { name: /generate/i }));

    await waitFor(() => {
      expect(screen.getByText('apple')).toBeInTheDocument();
      expect(screen.queryByText('banana')).not.toBeInTheDocument();
    });
  });

  it('allows toggling shopping list items', async () => {
    saveRecipes([
      { _id: '1', title: 'Recipe 1', ingredients: ['apple', 'banana'] }
    ]);

    render(<ShoppingList recipes={[]} />);

    fireEvent.click(screen.getByRole('button', { name: /generate/i }));

    await waitFor(() => {
      expect(screen.getByText('apple')).toBeInTheDocument();
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
      expect(screen.getByText('apple')).toBeInTheDocument();
      expect(screen.getByText('banana')).toBeInTheDocument();
    });

    setSavedRecipes([{ _id: '2', title: 'Recipe 2', ingredients: ['cherry', 'date'] }]);
    rerender(<ShoppingList recipes={[]} />);
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));

    await waitFor(() => {
      expect(screen.getByText('cherry')).toBeInTheDocument();
      expect(screen.getByText('date')).toBeInTheDocument();
      expect(screen.queryByText('apple')).not.toBeInTheDocument();
      expect(screen.queryByText('banana')).not.toBeInTheDocument();
    });
  });

  it('shows empty message when no saved recipes are loaded', async () => {
    render(<ShoppingList recipes={[]} />);

    fireEvent.click(screen.getByRole('button', { name: /generate/i }));

    await waitFor(() => {
      expect(screen.getByText('No ingredients found. Check if you have any saved recipes.')).toBeInTheDocument();
    });
  });
});