import { useQuery } from "react-query";

import { QUERY_KEYS } from "@consts";
import { useCardano } from "@context";
import { getProposal } from "@services";

export const useGetProposalQuery = (proposalId: string, enabled?: boolean) => {
  const { dRepID } = useCardano();

  const { data, isLoading, refetch, isRefetching } = useQuery(
    [QUERY_KEYS.useGetProposalKey, dRepID],
    () => getProposal(proposalId, dRepID),
    {
      staleTime: Infinity,
      enabled,
    },
  );

  return {
    data: data!,
    isLoading,
    refetch,
    isFetching: isRefetching,
  };
};
