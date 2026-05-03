import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { ShoppingList } from '../src/ShoppingList.jsx';
import { addSavedRecipe, setSavedRecipes, setUserIngredients } from '../src/varManager.jsx';

describe('Shopping List Feature', () => {
  beforeEach(() => {
    setSavedRecipes([]);
    setUserIngredients([]);
  });

  function saveRecipes(recipes) {
    recipes.forEach(addSavedRecipe);
  }

  it('loads shopping list with deduplicated and sorted ingredients from saved recipes', async () => {
    saveRecipes([
      { _id: '1', title: 'Recipe 1', ingredients: ['apple', 'banana', 'cherry'] },
      { _id: '2', title: 'Recipe 2', ingredients: ['banana', 'date', 'elderberry'] }
    ]);

    render(<ShoppingList recipes={[]} />);

    const generateButton = screen.getByRole('button', { name: /generate from saved recipes/i });
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

    const generateButton = screen.getByRole('button', { name: /generate from saved recipes/i });
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

    const generateButton = screen.getByRole('button', { name: /generate from saved recipes/i });
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

    const generateButton = screen.getByRole('button', { name: /generate from saved recipes/i });
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

    fireEvent.click(screen.getByRole('button', { name: /generate from saved recipes/i }));

    await waitFor(() => {
      expect(screen.getByText('apple')).toBeInTheDocument();
      expect(screen.queryByText('banana')).not.toBeInTheDocument();
    });
  });

  it('loads shopping list from saved ingredient tracker items', async () => {
    setUserIngredients([
      { id: '1', text: { info: ['banana', '2', '2026-01-01'] } },
      { id: '2', text: { info: ['Apple', '1', '2026-02-02'] } },
      { id: '3', text: { info: ['banana', '3', '2026-03-03'] } }
    ]);

    render(<ShoppingList recipes={[]} />);

    fireEvent.click(screen.getByRole('button', { name: /load from ingredient tracker/i }));

    await waitFor(() => {
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(2);
      expect(listItems[0]).toHaveTextContent('Apple');
      expect(listItems[1]).toHaveTextContent('banana');
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('banana')).toBeInTheDocument();
    });
  });

  it('allows toggling shopping list items', async () => {
    saveRecipes([
      { _id: '1', title: 'Recipe 1', ingredients: ['apple', 'banana'] }
    ]);

    render(<ShoppingList recipes={[]} />);

    fireEvent.click(screen.getByRole('button', { name: /generate from saved recipes/i }));

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

    fireEvent.click(screen.getByRole('button', { name: /generate from saved recipes/i }));

    await waitFor(() => {
      expect(screen.getByText('apple')).toBeInTheDocument();
      expect(screen.getByText('banana')).toBeInTheDocument();
    });

    setSavedRecipes([{ _id: '2', title: 'Recipe 2', ingredients: ['cherry', 'date'] }]);
    rerender(<ShoppingList recipes={[]} />);
    fireEvent.click(screen.getByRole('button', { name: /generate from saved recipes/i }));

    await waitFor(() => {
      expect(screen.getByText('cherry')).toBeInTheDocument();
      expect(screen.getByText('date')).toBeInTheDocument();
      expect(screen.queryByText('apple')).not.toBeInTheDocument();
      expect(screen.queryByText('banana')).not.toBeInTheDocument();
    });
  });

  it('shows empty message when no saved recipes are loaded', async () => {
    render(<ShoppingList recipes={[]} />);

    fireEvent.click(screen.getByRole('button', { name: /generate from saved recipes/i }));

    await waitFor(() => {
      expect(screen.getByText('No ingredients found.')).toBeInTheDocument();
    });
  });
});