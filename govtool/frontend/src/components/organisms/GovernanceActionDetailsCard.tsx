import { useScreenDimension } from "@hooks";
import { Box } from "@mui/material";
import { Button, Typography } from "../atoms";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { GovActionDetails, VoteActionForm, VotesSubmitted } from "../molecules";
import { useModal } from "@context";
import { ICONS } from "@consts";
import { Tooltip } from "@atoms";
import { tooltips } from "@/consts/texts";

type GovernanceActionDetailsCardProps = {
  abstainVotes: number;
  createdDate: string;
  details: any;
  expiryDate: string;
  noVotes: number;
  type: string;
  url: string;
  yesVotes: number;
  shortenedGovActionId: string;
  isDRep?: boolean;
  voteFromEP?: string;
};

export const GovernanceActionDetailsCard = ({
  abstainVotes,
  createdDate,
  details,
  expiryDate,
  noVotes,
  type,
  url,
  yesVotes,
  isDRep,
  voteFromEP,
  shortenedGovActionId,
}: GovernanceActionDetailsCardProps) => {
  const { screenWidth } = useScreenDimension();
  const { openModal } = useModal();

  return (
    <Box
      borderRadius={4.5}
      boxShadow="0px 2px 10px 2px rgba(0, 51, 173, 0.15)"
      display="flex"
      flexDirection={screenWidth < 1024 ? "column" : "row"}
      mt={3}
      maxWidth={890}
      overflow="visible"
      width="100%"
      data-testid="governance-action-details-card"
    >
      <Box
        bgcolor="rgba(255, 255, 255, 0.6)"
        display="flex"
        flexDirection="column"
        px={screenWidth < 1024 ? 3 : 5}
        py={screenWidth < 1024 ? 3 : 4}
        sx={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: screenWidth < 1024 ? 20 : 0,
          borderBottomLeftRadius: screenWidth < 1024 ? 0 : 20,
        }}
        width={screenWidth < 1024 ? "auto" : "40%"}
      >
        <Box
          border={1}
          borderColor="lightBlue"
          borderRadius={3}
          display="flex"
          flexDirection="column"
        >
          <Box
            alignItems="center"
            bgcolor="#D6E2FF80"
            display="flex"
            flex={1}
            justifyContent="center"
            py={0.75}
            width="100%"
          >
            <Typography fontWeight={300} sx={{ mr: 1 }} variant="caption">
              Submission date:
            </Typography>
            <Typography fontWeight={600} variant="caption">
              {createdDate}
            </Typography>
            <Tooltip
              heading={tooltips.submissionDate.heading}
              paragraphOne={tooltips.submissionDate.paragraphOne}
              placement={"bottom-end"}
              arrow
            >
              <InfoOutlinedIcon
                style={{
                  color: "#ADAEAD",
                }}
                sx={{ ml: 1.25 }}
                fontSize="small"
              />
            </Tooltip>
          </Box>
          <Box
            justifyContent="center"
            alignItems="center"
            display={"flex"}
            flex={1}
            py={0.75}
            width={"100%"}
          >
            <Typography fontWeight={300} sx={{ mr: 1 }} variant="caption">
              Expiry date:
            </Typography>
            <Typography fontWeight={600} variant="caption">
              {expiryDate}
            </Typography>
            <Tooltip
              heading={tooltips.expiryDate.heading}
              paragraphOne={tooltips.expiryDate.paragraphOne}
              paragraphTwo={tooltips.expiryDate.paragraphTwo}
              placement={"bottom-end"}
              arrow
            >
              <InfoOutlinedIcon
                style={{
                  color: "#ADAEAD",
                }}
                sx={{ ml: 1.25 }}
                fontSize="small"
              />
            </Tooltip>
          </Box>
        </Box>
        <Box flex={1} mt={3}>
          <Box>
            <Typography color="neutralGray" variant="caption">
              Governance Action Type:
            </Typography>
            <Box display={"flex"}>
              <Box mt={1} px={2} py={1} bgcolor="lightBlue" borderRadius={100}>
                <Typography variant="caption">{type}</Typography>
              </Box>
            </Box>
          </Box>
          <Box mt={4}>
            <Typography color="neutralGray" variant="caption">
              Governance Action ID:
            </Typography>
            <Box display="flex">
              <Box
                px={2}
                py={1}
                border={1}
                borderColor="lightBlue"
                borderRadius={100}
              >
                <Typography variant="caption">
                  {shortenedGovActionId}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box mt={4}>
            <Typography color="neutralGray" variant="caption">
              Governance Details:
            </Typography>
            {typeof details === "object" && details !== null ? (
              Object.entries(details).map(([key, value]) => {
                return (
                  <div key={key}>
                    {<GovActionDetails title={key} value={value} />}
                  </div>
                );
              })
            ) : (
              <Typography
                sx={{ textOverflow: "ellipsis", overflow: "hidden" }}
                variant="caption"
              >
                {details}
              </Typography>
            )}
          </Box>
        </Box>
        <Button
          onClick={() => {
            openModal({
              type: "externalLink",
              state: {
                externalLink: url,
              },
            });
          }}
          sx={{
            mt: 8,
            width: screenWidth < 1024 ? "100%" : "fit-content",
            alignSelf: screenWidth < 1024 ? "center" : "auto",
          }}
          variant="text"
          data-testid="view-other-details-button"
        >
          <Typography variant="body2" fontWeight={500} color="primary">
            View other details
          </Typography>
          <img
            alt="external link"
            src={ICONS.externalLinkIcon}
            height="20"
            width="20"
            style={{ marginLeft: "8px" }}
          />
        </Button>
      </Box>
      <Box
        bgcolor="rgba(255, 255, 255, 0.2)"
        display="flex"
        flex={1}
        px={screenWidth < 1024 ? 3 : 5}
        py={4}
        sx={{
          borderBottomLeftRadius: screenWidth < 1024 ? 20 : 0,
          borderBottomRightRadius: 20,
          borderTopRightRadius: screenWidth < 1024 ? 0 : 20,
        }}
      >
        {isDRep ? (
          <VoteActionForm
            voteFromEP={voteFromEP ? voteFromEP.toLowerCase() : undefined}
            yesVotes={yesVotes}
            noVotes={noVotes}
            abstainVotes={abstainVotes}
          />
        ) : (
          <VotesSubmitted
            yesVotes={yesVotes}
            noVotes={noVotes}
            abstainVotes={abstainVotes}
          />
        )}
      </Box>
    </Box>
  );
};