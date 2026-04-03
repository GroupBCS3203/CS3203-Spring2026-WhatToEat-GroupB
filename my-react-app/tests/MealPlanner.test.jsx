import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import '@testing-library/jest-dom';
import { test, expect } from "vitest";
import App from "../src/App";

test("planner tab shows month title and navigation controls", async () => {
  render(<App />);

  const plannerTab = screen.getByText(/planner/i);
  userEvent.click(plannerTab);

  // Month/year label in header
  const monthLabel = await screen.findByText(/\w+\s+\d{4}/);
  expect(monthLabel).toBeInTheDocument();

  expect(screen.getByRole('button', { name: /create event/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '◀' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '▶' })).toBeInTheDocument();
});

test("opening event form and adding an event appears on day cell", async () => {
  render(<App />);

  userEvent.click(screen.getByText(/planner/i));

  userEvent.click(screen.getByRole('button', { name: /create event/i }));

  const today = new Date();
  const formatted = today.toISOString().split('T')[0];

  const dateInput = screen.getByLabelText(/event date/i);
  userEvent.clear(dateInput);
  userEvent.type(dateInput, formatted);

  const nameInput = screen.getByLabelText(/food name/i);
  userEvent.type(nameInput, 'Test Meal');

  const timeInput = screen.getByLabelText(/time/i);
  userEvent.type(timeInput, '18:30');

  userEvent.click(screen.getByRole('button', { name: /save/i }));

  // Event should appear in calendar cell (displayed as text + time)
  const eventText = await screen.findByText(/18:30\s+Test Meal/i);
  expect(eventText).toBeInTheDocument();
});

test("month navigation updates the displayed month", async () => {
  render(<App />);

  userEvent.click(screen.getByText(/planner/i));

  const monthLabel = screen.getByText(/\w+\s+\d{4}/);
  const originalMonth = monthLabel.textContent;

  userEvent.click(screen.getByRole('button', { name: '▶' }));

  const nextMonthLabel = await screen.findByText((content) => content !== originalMonth && /\w+\s+\d{4}/.test(content));
  expect(nextMonthLabel).toBeInTheDocument();
});
