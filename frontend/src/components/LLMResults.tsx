// src/components/LLMResults.tsx
import React from "react";
import { Box } from "@mui/material";
import ResultCard from "./ResultCard";
import { ResponseState } from "../App";
import Grid from '@mui/material/Grid2';

interface LLMResultsProps {
  results: ResponseState;
}

const LLMResults: React.FC<LLMResultsProps> = ({ results }) => {
  // Grid can dynamically adjust based on the number of results.
  // const columns = Object.keys(results).length;
  // const rows = 1

  console.log(results);

  const cardWidth = 12 / Object.keys(results).length;

  return (
    <Box
    >
      <Grid container spacing={2} direction="row">
      {Object.entries(results).map((res, index) => {
        console.log("----------------", res);
        return (
          <Grid size={cardWidth}>
            <ResultCard
              llmName={res[0]}
              result={res[1]}
            />

          </Grid>
        );
      })}
      </Grid>
    </Box>
  );
};

export default LLMResults;
