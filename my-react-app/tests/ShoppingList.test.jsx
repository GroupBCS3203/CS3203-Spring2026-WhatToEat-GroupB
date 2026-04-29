import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import App from '../src/App';

// Mock fetch globally
global.fetch = vi.fn();

describe('Shopping List Feature', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Mock the environment variable
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
  });

  it('loads shopping list with deduplicated and sorted ingredients from current recipes', async () => {
    // Mock initial fetch for top recipes
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve([
        {
          _id: '1',
          title: 'Recipe 1',
          ingredients: ['apple', 'banana', 'cherry']
        },
        {
          _id: '2',
          title: 'Recipe 2',
          ingredients: ['banana', 'date', 'elderberry']
        }
      ])
    });

    render(<App />);

    // Wait for initial recipes to load
    await waitFor(() => {
      expect(screen.getByText('Recipe 1')).toBeInTheDocument();
      expect(screen.getByText('Recipe 2')).toBeInTheDocument();
    });

    // Switch to shopping list tab
    const shoppingListTab = screen.getByRole('button', { name: /shopping-list/i });
    fireEvent.click(shoppingListTab);

    // Click generate button to load shopping list
    const generateButton = screen.getByRole('button', { name: /generate from current recipes/i });
    fireEvent.click(generateButton);

    // The list should be loaded
    await waitFor(() => {
      expect(screen.getByText('apple')).toBeInTheDocument();
      expect(screen.getByText('banana')).toBeInTheDocument();
      expect(screen.getByText('cherry')).toBeInTheDocument();
      expect(screen.getByText('date')).toBeInTheDocument();
      expect(screen.getByText('elderberry')).toBeInTheDocument();
    });

    // Verify alphabetical order (apple, banana, cherry, date, elderberry)
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(5);
    expect(listItems[0]).toHaveTextContent('apple');
    expect(listItems[1]).toHaveTextContent('banana');
    expect(listItems[2]).toHaveTextContent('cherry');
    expect(listItems[3]).toHaveTextContent('date');
    expect(listItems[4]).toHaveTextContent('elderberry');
  });

  it('handles recipes with string ingredients (comma-separated)', async () => {
    // Mock recipes with string ingredients
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve([
        {
          _id: '1',
          title: 'Recipe 1',
          ingredients: 'apple, banana, cherry'
        }
      ])
    });

    render(<App />);

    // Wait for recipes to load
    await waitFor(() => {
      expect(screen.getByText('Recipe 1')).toBeInTheDocument();
    });

    // Switch to shopping list tab and click generate
    const shoppingListTab = screen.getByRole('button', { name: /shopping-list/i });
    fireEvent.click(shoppingListTab);

    const generateButton = screen.getByRole('button', { name: /generate from current recipes/i });
    fireEvent.click(generateButton);

    // Check ingredients are parsed correctly
    await waitFor(() => {
      expect(screen.getByText('apple')).toBeInTheDocument();
      expect(screen.getByText('banana')).toBeInTheDocument();
      expect(screen.getByText('cherry')).toBeInTheDocument();
    });
  });

  it('deduplicates ingredients across recipes', async () => {
    // Mock recipes with overlapping ingredients
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve([
        {
          _id: '1',
          title: 'Recipe 1',
          ingredients: ['apple', 'banana']
        },
        {
          _id: '2',
          title: 'Recipe 2',
          ingredients: ['banana', 'cherry']
        },
        {
          _id: '3',
          title: 'Recipe 3',
          ingredients: ['apple', 'cherry', 'date']
        }
      ])
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Recipe 1')).toBeInTheDocument();
      expect(screen.getByText('Recipe 2')).toBeInTheDocument();
      expect(screen.getByText('Recipe 3')).toBeInTheDocument();
    });

    // Switch to shopping list and generate
    const shoppingListTab = screen.getByRole('button', { name: /shopping-list/i });
    fireEvent.click(shoppingListTab);

    const generateButton = screen.getByRole('button', { name: /generate from current recipes/i });
    fireEvent.click(generateButton);

    // Should have 4 unique ingredients: apple, banana, cherry, date
    await waitFor(() => {
      expect(screen.getByText('apple')).toBeInTheDocument();
      expect(screen.getByText('banana')).toBeInTheDocument();
      expect(screen.getByText('cherry')).toBeInTheDocument();
      expect(screen.getByText('date')).toBeInTheDocument();
    });

    // Verify deduplication worked (no duplicates)
    const appleElements = screen.getAllByText('apple');
    const bananaElements = screen.getAllByText('banana');
    const cherryElements = screen.getAllByText('cherry');
    const dateElements = screen.getAllByText('date');

    expect(appleElements).toHaveLength(1);
    expect(bananaElements).toHaveLength(1);
    expect(cherryElements).toHaveLength(1);
    expect(dateElements).toHaveLength(1);
  });

  it('handles case-insensitive alphabetical sorting', async () => {
    // Mock recipes with mixed case ingredients
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve([
        {
          _id: '1',
          title: 'Recipe 1',
          ingredients: ['Zucchini', 'apple', 'Banana', 'cherry']
        }
      ])
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Recipe 1')).toBeInTheDocument();
    });

    // Switch to shopping list and generate
    const shoppingListTab = screen.getByRole('button', { name: /shopping-list/i });
    fireEvent.click(shoppingListTab);

    const generateButton = screen.getByRole('button', { name: /generate from current recipes/i });
    fireEvent.click(generateButton);

    // Should be sorted: apple, Banana, cherry, Zucchini (case-insensitive)
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
    // Mock simple recipe
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve([
        {
          _id: '1',
          title: 'Recipe 1',
          ingredients: ['apple', 'banana']
        }
      ])
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Recipe 1')).toBeInTheDocument();
    });

    // Switch to shopping list and generate
    const shoppingListTab = screen.getByRole('button', { name: /shopping-list/i });
    fireEvent.click(shoppingListTab);

    const generateButton = screen.getByRole('button', { name: /generate from current recipes/i });
    fireEvent.click(generateButton);

    // Wait for items to appear
    await waitFor(() => {
      expect(screen.getByText('apple')).toBeInTheDocument();
    });

    // Find checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);

    // Initially unchecked
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();

    // Click first checkbox
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();

    // Click second checkbox
    fireEvent.click(checkboxes[1]);
    expect(checkboxes[1]).toBeChecked();

    // Click first again to uncheck
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).not.toBeChecked();
  });

  it('updates shopping list when recipes change after search', async () => {
    // Initial load with top recipes
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve([
        {
          _id: '1',
          title: 'Recipe 1',
          ingredients: ['apple', 'banana']
        }
      ])
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Recipe 1')).toBeInTheDocument();
    });

    // Switch to shopping list and generate
    const shoppingListTab = screen.getByRole('button', { name: /shopping-list/i });
    fireEvent.click(shoppingListTab);

    const generateButton = screen.getByRole('button', { name: /generate from current recipes/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('apple')).toBeInTheDocument();
      expect(screen.getByText('banana')).toBeInTheDocument();
    });

    // Go back to recipes tab
    const recipesTab = screen.getByRole('button', { name: 'recipes' });
    fireEvent.click(recipesTab);

    // Mock search results
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve([
        {
          _id: '2',
          title: 'Recipe 2',
          ingredients: ['cherry', 'date']
        }
      ])
    });

    // Perform search
    const searchInput = screen.getByPlaceholderText('Search here...');
    fireEvent.change(searchInput, { target: { value: 'cherry' } });

    const searchButton = screen.getByRole('button', { name: /get 10 recipes/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Recipe 2')).toBeInTheDocument();
    });

    // Go back to shopping list and regenerate
    fireEvent.click(shoppingListTab);
    fireEvent.click(generateButton);

    // Should now show ingredients from search results
    await waitFor(() => {
      expect(screen.getByText('cherry')).toBeInTheDocument();
      expect(screen.getByText('date')).toBeInTheDocument();
      // Old ingredients should not be there
      expect(screen.queryByText('apple')).not.toBeInTheDocument();
      expect(screen.queryByText('banana')).not.toBeInTheDocument();
    });
  });

  it('shows empty message when no recipes are loaded', async () => {
    // Mock empty recipes
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve([])
    });

    render(<App />);

    // Switch to shopping list
    const shoppingListTab = screen.getByRole('button', { name: /shopping-list/i });
    fireEvent.click(shoppingListTab);

    const generateButton = screen.getByRole('button', { name: /generate from current recipes/i });
    fireEvent.click(generateButton);

    // Should show no ingredients message
    await waitFor(() => {
      expect(screen.getByText('No ingredients found.')).toBeInTheDocument();
    });
  });
});