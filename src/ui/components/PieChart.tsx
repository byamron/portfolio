"use client";
/*
 * Documentation:
 * Pie Chart — https://app.subframe.com/b82957b2b077/library?component=Pie+Chart_0654ccc7-054c-4f3a-8e9a-b7c81dd3963c
 */

import React from "react";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface PieChartRootProps
  extends React.ComponentProps<typeof SubframeCore.PieChart> {
  className?: string;
}

const PieChartRoot = React.forwardRef<
  React.ElementRef<typeof SubframeCore.PieChart>,
  PieChartRootProps
>(function PieChartRoot({ className, ...otherProps }: PieChartRootProps, ref) {
  return (
    <SubframeCore.PieChart
      className={SubframeUtils.twClassNames("h-52 w-52", className)}
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

export const PieChart = PieChartRoot;
