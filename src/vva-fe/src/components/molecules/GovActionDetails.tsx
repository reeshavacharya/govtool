import { Typography } from "../atoms";

export const GovActionDetails = ({
  title,
  value,
}: {
  title: string;
  value: any;
}) => {
  if (Array.isArray(value)) {
    return (
      <div>
        <Typography variant="caption">{title}:</Typography>
        <ul>
          {value.map((item, index) => (
            <li key={index}>
              <Typography
                sx={{ textOverflow: "ellipsis", overflow: "hidden" }}
                variant="caption"
              >
                {item}
              </Typography>
            </li>
          ))}
        </ul>
      </div>
    );
  } else if (typeof value === "boolean") {
    return (
      <Typography
        sx={{ textOverflow: "ellipsis", overflow: "hidden" }}
        variant="caption"
      >
        {title}: {value ? "True" : "False"}
      </Typography>
    );
  } else {
    return (
      <Typography
        sx={{ textOverflow: "ellipsis", overflow: "hidden" }}
        variant="caption"
      >
        {title}: {value}
      </Typography>
    );
  }
};
