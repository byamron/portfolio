"use client";
/*
 * Documentation:
 * Bar Chart — https://app.subframe.com/b82957b2b077/library?component=Bar+Chart_4d4f30e7-1869-4980-8b96-617df3b37912
 */

import React from "react";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface BarChartRootProps
  extends React.ComponentProps<typeof SubframeCore.BarChart> {
  stacked?: boolean;
  className?: string;
}

const BarChartRoot = React.forwardRef<
  React.ElementRef<typeof SubframeCore.BarChart>,
  BarChartRootProps
>(function BarChartRoot(
  { stacked = false, className, ...otherProps }: BarChartRootProps,
  ref
) {
  return (
    <SubframeCore.BarChart
      className={SubframeUtils.twClassNames("h-80 w-full", className)}
      ref={ref}
      stacked={stacked}
      colors={[
        "#ff7052",
        "#ffdcd3",
        "#f04c30",
        "#ffc3b4",
        "#d13721",
        "#ff9d85",
      ]}
      {...otherProps}
    />
  );
});

export const BarChart = BarChartRoot;
