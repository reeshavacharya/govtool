import removeAllSpaces from "@helpers/removeAllSpaces";
import { Locator, Page, expect } from "@playwright/test";
import { FilterOption, IProposal } from "@types";
import environments from "lib/constants/environments";
import GovernanceActionDetailsPage from "./governanceActionDetailsPage";

const MAX_SLIDES_DISPLAY_PER_TYPE = 6;

export default class GovernanceActionsPage {
  readonly filterBtn = this.page.getByTestId("filters-button");
  readonly sortBtn = this.page.getByTestId("sort-button");
  readonly votedTab = this.page.getByTestId("voted-tab");
  readonly searchInput = this.page.getByTestId("search-input");

  readonly actionsLoading = this.page.getByRole("progressbar").getByRole("img");

  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(`${environments.frontendUrl}/governance_actions`);
    await expect(this.page.getByTestId("alert-success")).not.toBeVisible();
    // await this.page.waitForTimeout(2_000); // Wallet popup affects filter in test
  }

  async viewProposal(
    proposal: IProposal
  ): Promise<GovernanceActionDetailsPage> {
    const proposalId = `govaction-${proposal.txHash}#${proposal.index}-view-detail`;
    await this.page.getByTestId(proposalId).click();

    return new GovernanceActionDetailsPage(this.page);
  }

  async viewFirstProposal(): Promise<GovernanceActionDetailsPage> {
    await this.page
      .locator('[data-testid^="govaction-"][data-testid$="-view-detail"]')
      .first()
      .click();
    return new GovernanceActionDetailsPage(this.page);
  }

  async viewFirstVotedProposal(): Promise<GovernanceActionDetailsPage> {
    await this.page
      .locator('[data-testid^="govaction-"][data-testid$="-change-your-vote"]')
      .first()
      .click();
    return new GovernanceActionDetailsPage(this.page);
  }

  async viewVotedProposal(
    proposal: IProposal
  ): Promise<GovernanceActionDetailsPage> {
    const proposalId = `govaction-${proposal.txHash}#${proposal.index}-change-your-vote`;
    await this.page.getByTestId(proposalId).click();

    return new GovernanceActionDetailsPage(this.page);
  }

  async filterProposalByNames(names: string[]) {
    for (const name of names) {
      const sanitizedProposalName = removeAllSpaces(name);
      await this.page.getByTestId(`${sanitizedProposalName}-checkbox`).click();
    }
  }

  async unFilterProposalByNames(names: string[]) {
    for (const name of names) {
      const sanitizedProposalName = removeAllSpaces(name);
      await this.page.getByTestId(`${sanitizedProposalName}-checkbox`).click();
    }
  }

  async getAllProposals() {
    await this.page.waitForTimeout(4_000); // waits for proposals to render
    return this.page.locator('[data-testid$="-card"]').all();
  }

  async validateFilters(filters: string[]) {
    const proposalCards = await this.getAllProposals();

    for (const proposalCard of proposalCards) {
      const hasFilter = await this._validateFiltersInProposalCard(
        proposalCard,
        filters
      );
      expect(
        hasFilter,
        "A proposal card does not contain any of the filters"
      ).toBe(true);
    }
  }

  async sortProposal(option: string) {
    await this.page.getByTestId(`${option}-radio`).check();
  }

  async sortAndValidate(
    sortOption: string,
    validationFn: (p1: IProposal, p2: IProposal) => boolean,
    filterKeys = Object.keys(FilterOption)
  ) {
    const responsesPromise = Promise.all(
      filterKeys.map((filterKey) =>
        this.page.waitForResponse((response) =>
          response
            .url()
            .includes(`&type[]=${FilterOption[filterKey]}&sort=${sortOption}`)
        )
      )
    );

    await this.sortProposal(sortOption);
    const responses = await responsesPromise;

    let proposalData: IProposal[][] = await Promise.all(
      responses.map(async (response) => {
        const { elements } = await response.json();
        return elements.length ? elements : null;
      })
    );
    const proposalsByType = proposalData.filter(Boolean);

    // API validation
    proposalsByType.forEach(async (proposalList) => {
      if (proposalList.length <= 1) return;

      const proposals = proposalList;
      for (let i = 0; i <= proposals.length - 2; i++) {
        const isValid = validationFn(proposals[i], proposals[i + 1]);
        expect(isValid).toBe(true);
      }
    });

    await this.page.waitForTimeout(4_000); // wait for proposals to render

    // Frontend validation
    for (let dIdx = 0; dIdx <= proposalsByType.length - 1; dIdx++) {
      const proposals = proposalsByType[0] as IProposal[];
      const slides = await this.page
        .locator(`[data-testid="govaction-${proposals[0].type}-card"]`)
        .all();

      const actualSlidesInDisplay =
        proposals.length > MAX_SLIDES_DISPLAY_PER_TYPE
          ? MAX_SLIDES_DISPLAY_PER_TYPE
          : proposals.length;

      expect(slides).toHaveLength(actualSlidesInDisplay);

      for (let i = 0; i <= slides.length - 1; i++) {
        await expect(slides[i]).toContainText(`${proposals[i].txHash}`);
      }
    }
  }

  async _validateFiltersInProposalCard(
    proposalCard: Locator,
    filters: string[]
  ): Promise<boolean> {
    const govActionTypeTextContent = await proposalCard
      .locator('[data-testid$="-type"]')
      .textContent();
    const govActionType = govActionTypeTextContent.split(":")[1];

    return filters.includes(govActionType);
  }
}
