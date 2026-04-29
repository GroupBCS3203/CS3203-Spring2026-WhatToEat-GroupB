import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { ShoppingList } from '../src/ShoppingList.jsx';

describe('Shopping List Feature', () => {
  it('loads shopping list with deduplicated and sorted ingredients from current recipes', async () => {
    render(
      <ShoppingList
        recipes={[
          { _id: '1', title: 'Recipe 1', ingredients: ['apple', 'banana', 'cherry'] },
          { _id: '2', title: 'Recipe 2', ingredients: ['banana', 'date', 'elderberry'] }
        ]}
      />
    );

    const generateButton = screen.getByRole('button', { name: /generate from current recipes/i });
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

  it('handles recipes with string ingredients (comma-separated)', async () => {
    render(
      <ShoppingList
        recipes={[{ _id: '1', title: 'Recipe 1', ingredients: 'apple, banana, cherry' }]}
      />
    );

    const generateButton = screen.getByRole('button', { name: /generate from current recipes/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('apple')).toBeInTheDocument();
      expect(screen.getByText('banana')).toBeInTheDocument();
      expect(screen.getByText('cherry')).toBeInTheDocument();
    });
  });

  it('deduplicates ingredients across recipes', async () => {
    render(
      <ShoppingList
        recipes={[
          { _id: '1', title: 'Recipe 1', ingredients: ['apple', 'banana'] },
          { _id: '2', title: 'Recipe 2', ingredients: ['banana', 'cherry'] },
          { _id: '3', title: 'Recipe 3', ingredients: ['apple', 'cherry', 'date'] }
        ]}
      />
    );

    const generateButton = screen.getByRole('button', { name: /generate from current recipes/i });
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
    render(
      <ShoppingList
        recipes={[{ _id: '1', title: 'Recipe 1', ingredients: ['Zucchini', 'apple', 'Banana', 'cherry'] }]}
      />
    );

    const generateButton = screen.getByRole('button', { name: /generate from current recipes/i });
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

  it('allows toggling shopping list items', async () => {
    render(
      <ShoppingList
        recipes={[{ _id: '1', title: 'Recipe 1', ingredients: ['apple', 'banana'] }]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /generate from current recipes/i }));

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

  it('updates shopping list when recipes change after rerender', async () => {
    const { rerender } = render(
      <ShoppingList
        recipes={[{ _id: '1', title: 'Recipe 1', ingredients: ['apple', 'banana'] }]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /generate from current recipes/i }));

    await waitFor(() => {
      expect(screen.getByText('apple')).toBeInTheDocument();
      expect(screen.getByText('banana')).toBeInTheDocument();
    });

    rerender(
      <ShoppingList
        recipes={[{ _id: '2', title: 'Recipe 2', ingredients: ['cherry', 'date'] }]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /generate from current recipes/i }));

    await waitFor(() => {
      expect(screen.getByText('cherry')).toBeInTheDocument();
      expect(screen.getByText('date')).toBeInTheDocument();
      expect(screen.queryByText('apple')).not.toBeInTheDocument();
      expect(screen.queryByText('banana')).not.toBeInTheDocument();
    });
  });

  it('shows empty message when no recipes are loaded', async () => {
    render(<ShoppingList recipes={[]} />);

    fireEvent.click(screen.getByRole('button', { name: /generate from current recipes/i }));

    await waitFor(() => {
      expect(screen.getByText('No ingredients found.')).toBeInTheDocument();
    });
  });
});