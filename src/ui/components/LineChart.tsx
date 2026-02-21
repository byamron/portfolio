"use client";
/*
 * Documentation:
 * Line Chart — https://app.subframe.com/b82957b2b077/library?component=Line+Chart_22944dd2-3cdd-42fd-913a-1b11a3c1d16d
 */

import React from "react";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface LineChartRootProps
  extends React.ComponentProps<typeof SubframeCore.LineChart> {
  className?: string;
}

const LineChartRoot = React.forwardRef<
  React.ElementRef<typeof SubframeCore.LineChart>,
  LineChartRootProps
>(function LineChartRoot(
  { className, ...otherProps }: LineChartRootProps,
  ref
) {
  return (
    <SubframeCore.LineChart
      className={SubframeUtils.twClassNames("h-80 w-full", className)}
      ref={ref}
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

export const LineChart = LineChartRoot;
