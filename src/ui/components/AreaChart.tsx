"use client";
/*
 * Documentation:
 * Area Chart — https://app.subframe.com/b82957b2b077/library?component=Area+Chart_8aa1e7b3-5db6-4a62-aa49-137ced21a231
 */

import React from "react";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface AreaChartRootProps
  extends React.ComponentProps<typeof SubframeCore.AreaChart> {
  stacked?: boolean;
  className?: string;
}

const AreaChartRoot = React.forwardRef<
  React.ElementRef<typeof SubframeCore.AreaChart>,
  AreaChartRootProps
>(function AreaChartRoot(
  { stacked = false, className, ...otherProps }: AreaChartRootProps,
  ref
) {
  return (
    <SubframeCore.AreaChart
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

export const AreaChart = AreaChartRoot;
