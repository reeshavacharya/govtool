export {};

declare global {
  type VoteType = "yes" | "no" | "abstain";

  type ActionTypeFromAPI = {
    id: string;
    type: string;
    details: string;
    expiryDate: string;
    url: string;
    metadataHash: string;
  };

  type ActionType = {
    id: string;
    type: string;
    details?: string;
    expiryDate: string;
    createdDate: string;
    url?: string;
    metadataHash?: string;
    yesVotes: number;
    noVotes: number;
    abstainVotes: number;
    index: number;
    txHash: string;
  };

  interface ActionVotedOnType extends ActionType {
    vote: VoteType;
  }

  type VotedOnDataType = {
    title: string;
    actions: ActionVotedOnType[];
  }[];

  type ToVoteDataType = {
    title: string;
    actions: ActionType[];
  }[];

  type NestedKeys<T> = T extends Record<string, any>
    ? {
        [K in keyof T]: T[K] extends Record<string, any>
          ? `${string & K}.${NestedKeys<T[K]>}`
          : string & K;
      }[keyof T]
    : never;
}
