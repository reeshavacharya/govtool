import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Breadcrumbs,
  CircularProgress,
  Divider,
  Link,
} from "@mui/material";

import { Background, Typography } from "@atoms";
import { ICONS, PATHS } from "@consts";
import { useCardano } from "@context";
import { DataActionsBar, GovernanceActionCard } from "@molecules";
import { Footer, TopNav } from "@organisms";
import {
  useGetDRepVotesQuery,
  useGetProposalsInfiniteQuery,
  useFetchNextPageDetector,
  useSaveScrollPosition,
  useScreenDimension,
} from "@hooks";
import {
  WALLET_LS_KEY,
  getFullGovActionId,
  getItemFromLocalStorage,
  getProposalTypeLabel,
  removeDuplicatedProposals,
} from "@utils";

export const GovernanceActionsCategory = ({}) => {
  const { category } = useParams();
  const [searchText, setSearchText] = useState<string>("");
  const [sortOpen, setSortOpen] = useState(false);
  const [chosenSorting, setChosenSorting] = useState<string>("");
  const { isMobile, pagePadding, screenWidth } = useScreenDimension();
  const { isEnabled } = useCardano();
  const navigate = useNavigate();
  const { dRep } = useCardano();

  const {
    data: dRepVotes,
    dRepVotesAreLoading,
    isRefetching: votesRefetching,
  } = useGetDRepVotesQuery([], "");

  const {
    proposals,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
  } = useGetProposalsInfiniteQuery(
    [category?.replace(/ /g, "") ?? ""],
    chosenSorting
  );
  const loadNextPageRef = useRef(null);

  useFetchNextPageDetector(
    fetchNextPage,
    isLoading || isFetchingNextPage,
    hasNextPage
  );

  const saveScrollPosition = useSaveScrollPosition(isLoading, isFetching);

  const breadcrumbs = [
    <NavLink
      key="1"
      to={PATHS.dashboard_governance_actions}
      style={{ textDecorationColor: "#0033AD" }}
    >
      <Typography color="primary" fontWeight={300} variant="caption">
        Governance Actions
      </Typography>
    </NavLink>,
    <Typography fontWeight={500} key="2" variant="caption">
      {getProposalTypeLabel(category ?? "")}
    </Typography>,
  ];

  const mappedData = useMemo(() => {
    const uniqueProposals = removeDuplicatedProposals(proposals);

    return uniqueProposals?.filter((i) =>
      getFullGovActionId(i.txHash, i.index)
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );
  }, [
    proposals,
    dRep?.isRegistered,
    dRepVotes,
    searchText,
    isFetchingNextPage,
  ]);

  useEffect(() => {
    if (isEnabled && getItemFromLocalStorage(`${WALLET_LS_KEY}_stake_key`)) {
      const pathname = window.location.pathname;
      navigate("/connected" + pathname);
    }
  }, [isEnabled]);

  const closeSorts = useCallback(() => {
    setSortOpen(false);
  }, [setSortOpen]);

  return (
    <Background>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        minHeight="100vh"
      >
        <TopNav />
        <Box flex={1} mt={isMobile ? 3.25 : 6.25} overflow={"hidden"}>
          <Typography
            sx={{ mb: isMobile ? 3.75 : 6, px: pagePadding }}
            variant={isMobile ? "title1" : "headline3"}
          >
            Governance Actions
          </Typography>
          {isMobile && (
            <Divider
              style={{
                borderColor: "#FFFFFF",
                borderWidth: 1,
                marginBottom: 30,
              }}
            />
          )}
          <Box px={pagePadding} flex={1}>
            <Breadcrumbs
              separator="|"
              aria-label="breadcrumb"
              sx={{
                marginTop: screenWidth < 1024 ? 2.5 : 0,
                marginBottom: 5,
              }}
            >
              {breadcrumbs}
            </Breadcrumbs>
            <Link
              data-testid={"back-to-list-link"}
              sx={{
                cursor: "pointer",
                display: "flex",
                textDecoration: "none",
                marginBottom: 4.25,
              }}
              onClick={() => navigate(PATHS.dashboard_governance_actions)}
            >
              <img
                src={ICONS.arrowRightIcon}
                alt="arrow"
                style={{ marginRight: "12px", transform: "rotate(180deg)" }}
              />
              <Typography color="primary" fontWeight={400} variant="body2">
                Back to the list
              </Typography>
            </Link>
            <DataActionsBar
              isFiltering={false}
              searchText={searchText}
              setSearchText={setSearchText}
              sortOpen={sortOpen}
              setSortOpen={setSortOpen}
              sortingActive={Boolean(chosenSorting)}
              chosenSorting={chosenSorting}
              closeSorts={closeSorts}
              setChosenSorting={setChosenSorting}
            />
            <Box height={isMobile ? 60 : 80} />
            {!isLoading && !dRepVotesAreLoading && !votesRefetching ? (
              !mappedData?.length ? (
                <Typography fontWeight={300} sx={{ py: 4 }}>
                  <Box mt={4} display="flex" flexWrap="wrap">
                    <Typography fontWeight={300}>
                      Governnance actions with category&nbsp;
                    </Typography>
                    <Typography fontWeight={700}>{category}&nbsp;</Typography>
                    {searchText && (
                      <>
                        <Typography fontWeight={300}>
                          and search phrase&nbsp;
                        </Typography>
                        <Typography fontWeight={700}>{searchText}</Typography>
                      </>
                    )}
                    <Typography fontWeight={300}>&nbsp;don't exist.</Typography>
                  </Box>
                </Typography>
              ) : (
                <Box
                  columnGap={4}
                  display="grid"
                  gridTemplateColumns={`repeat(auto-fit, minmax(${
                    screenWidth < 375
                      ? "255px"
                      : screenWidth < 768
                      ? "294px"
                      : "402px"
                  }, 1fr))`}
                >
                  {mappedData.map((item) => (
                    <Box pb={4.25} key={item.txHash + item.index}>
                      <GovernanceActionCard
                        {...item}
                        txHash={item.txHash}
                        index={item.index}
                        onClick={() => {
                          saveScrollPosition();

                          navigate(
                            PATHS.governance_actions_action.replace(
                              ":proposalId",
                              getFullGovActionId(item.txHash, item.index)
                            ),
                            {
                              state: {
                                ...item,
                                openedFromCategoryPage: true,
                              },
                            }
                          );
                        }}
                      />
                    </Box>
                  ))}
                  {hasNextPage && isFetchingNextPage && (
                    <Box
                      py={4}
                      display="flex"
                      justifyContent="center"
                      ref={loadNextPageRef}
                    >
                      <CircularProgress />
                    </Box>
                  )}
                </Box>
              )
            ) : (
              <Box py={4} display="flex" justifyContent="center">
                <CircularProgress />
              </Box>
            )}
          </Box>
        </Box>
        <Footer />
      </Box>
    </Background>
  );
};