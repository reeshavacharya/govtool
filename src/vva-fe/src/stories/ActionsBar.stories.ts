import { DataActionsBar } from "@/components/molecules";
import { userEvent, within } from "@storybook/testing-library";
import { expect, jest } from "@storybook/jest";
import type { Meta, StoryObj } from "@storybook/react";
import {
  GOVERNANCE_ACTIONS_FILTERS,
  GOVERNANCE_ACTIONS_SORTING,
} from "@consts";

const meta = {
  title: "Example/DataActionsBar",
  component: DataActionsBar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DataActionsBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActionsBarComponent: Story = {
  args: {
    chosenSorting: "",
    searchText: "",
    sortingActive: false,
    sortOpen: false,
    isFiltering: true,
    setFiltersOpen: jest.fn(),
    setSortOpen: jest.fn(),
    setSearchText: jest.fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const { setFiltersOpen, setSortOpen, setSearchText } = args;
    const canvas = within(canvasElement);

    await step("Check if searching is working", async () => {
      const searchInput = canvas.getByTestId("search-input");
      await userEvent.type(searchInput, "info action");
      await expect(setSearchText).toHaveBeenCalled();
    });

    await step("Check if filter button is working", async () => {
      await userEvent.click(canvas.getByTestId("filters-button"));
      await expect(setSortOpen).toHaveBeenCalledWith(false); // Make sure sort dropdown is closed
      await expect(setFiltersOpen).toHaveBeenCalled();
    });

    await step("Check if sort button is working", async () => {
      await userEvent.click(canvas.getByTestId("sort-button"));
      await expect(setFiltersOpen).toHaveBeenCalledWith(false); // Make sure filter dropdown is closed
      await expect(setSortOpen).toHaveBeenCalled();
    });
  },
};

export const ActionsBarFiltersOpen: Story = {
  args: {
    chosenSorting: "",
    searchText: "",
    sortingActive: false,
    sortOpen: false,
    chosenFilters: [],
    closeFilters: () => {},
    filtersOpen: true,
    setFiltersOpen: () => {},
    setChosenFilters: jest.fn(),
  },

  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    for (const { key, label } of GOVERNANCE_ACTIONS_FILTERS) {
      await userEvent.click(
        canvas.getByTestId(`${label.replace(/ /g, "")}-checkbox`)
      );
      await expect(args.setChosenFilters).toHaveBeenCalledWith([key]);
    }
  },
};

export const ActionsBarSortsOpen: Story = {
  args: {
    chosenSorting: "",
    searchText: "",
    sortingActive: false,
    sortOpen: true,
    setChosenSorting: jest.fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    for (const { key } of GOVERNANCE_ACTIONS_SORTING) {
      await userEvent.click(canvas.getByTestId(`${key}-radio`));
      await expect(args.setChosenSorting).toHaveBeenCalledWith(key);
    }
  },
};

export const ActionsBarWithoutFilters: Story = {
  args: {
    chosenSorting: "",
    searchText: "",
    sortingActive: false,
    sortOpen: false,
    isFiltering: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByTestId("filters-button")
    ).not.toBeInTheDocument();
  },
};
