import React, { useMemo, useEffect, useState } from "react";

// visx packages
import { AxisBottom, AxisLeft } from "@visx/axis";
import { localPoint } from "@visx/event";
import { Grid } from "@visx/grid";
import { Group } from "@visx/group";
import { LegendOrdinal } from "@visx/legend";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { Bar } from "@visx/shape";
import { Text } from "@visx/text";
import { defaultStyles, useTooltip, useTooltipInPortal } from "@visx/tooltip";

// react-toastify
import { toast } from "react-toastify";

import { defaultMonthValues, gradientGreen, gradientRed, MONTHS, monthsName } from "../utils/utils";

const defaultMargin = { top: 40, right: 0, bottom: 0, left: 0 };
const verticalMargin = 120;

export default function PostsGraph({ width, height, margin = defaultMargin, data, countData, handleCountData }) {
  const count = data?.reduce(
    (acc, date) => {
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date]++;
      return acc;
    },
    { ...defaultMonthValues }
  );

  // accessors
  const getMonth = (d) => d.key;
  const getValue = (d) => d.value;

  const sortedCount = Object.entries(count ? count : {})
    ?.sort((a, b) => a[0] - b[0])
    ?.reduce((acc, [month, count]) => {
      acc[monthsName[month]] = count;
      return acc;
    }, {});

  const values = Object.entries(sortedCount).map(([month, count]) => {
    return {
      key: month,
      value: count,
    };
  });

  // bounds
  const xMax = width;
  const yMax = height - margin.top - 100;
  const DOMAIN_MAX = Math.max(...values.map(getValue));
  const DELIMITTER = Math.floor(DOMAIN_MAX / 2);

  // scales, memoize for performance
  const xScale = useMemo(() =>
    scaleBand(
      {
        range: [0, xMax],
        round: true,
        domain: MONTHS,
        padding: 0.4,
      },
      [xMax]
    )
  );
  const yScale = useMemo(() =>
    scaleLinear(
      {
        range: [yMax, 0],
        round: true,
        domain: [0, DOMAIN_MAX],
      },
      [yMax]
    )
  );

  const colorScale = scaleOrdinal({
    domain: [`Posts > ${DELIMITTER}`, `Posts <= ${DELIMITTER}`],
    range: [gradientGreen, gradientRed],
  });

  const tooltipStyles = {
    ...defaultStyles,
    minWidth: 60,
    backgroundColor: "rgba(0,0,0,0.9)",
    color: "white",
  };

  // tooltip handler
  let tooltipTimeout;

  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } = useTooltip();

  const { TooltipInPortal } = useTooltipInPortal({
    scroll: true,
  });

  xScale.rangeRound([0, xMax]);
  yScale.range([yMax + 2, 0]);

  return width < 10 ? null : (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={width} height={height} style={{ overflow: "visible" }}>
        <linearGradient id="greenGradient" gradientTransform="rotate(90)">
          <stop stopColor="#00da1e" offset="0%" />
          <stop stopColor="#17b718" offset="25%" />
          <stop stopColor="#1c9512" offset="50%" />
          <stop stopColor="#17550a" offset="100%" />
        </linearGradient>

        <linearGradient id="redGradient" gradientTransform="rotate(90)">
          <stop stopColor="#da0000" offset="0%" />
          <stop stopColor="#d80209" offset="25%" />
          <stop stopColor="#96050d" offset="50%" />
          <stop stopColor="#550a0a" offset="100%" />
        </linearGradient>

        {/* The grid behind the graph */}
        <Grid
          top={margin.top + 20}
          left={margin.left}
          xScale={xScale}
          yScale={yScale}
          width={xMax}
          height={yMax}
          stroke="black"
          strokeOpacity={0.1}
          xOffset={xScale.bandwidth() / 1.19}
        />

        {/* Title on the right */}
        <Text verticalAnchor="middle" fontSize={20} textAnchor="middle" x={width - 50} y={margin.top + 10}>
          {`Data Count: ${countData}`}
        </Text>

        <rect width={width} height={height} fill="url(#teal)" rx={14} />

        {/* Graph */}
        <Group top={verticalMargin / 2}>
          {values?.map((d) => {
            const month = getMonth(d);
            const barWidth = xScale.bandwidth();
            const barHeight = yMax - (yScale(getValue(d)) ?? 0);
            const barX = xScale(month);
            const barY = yMax - barHeight;
            return (
              <Bar
                key={`bar-${month}`}
                x={barX}
                y={barHeight <= 0 ? barY - 10 : barY}
                width={barWidth}
                height={barHeight <= 0 ? 10 : barHeight}
                fill={`url(${d.value > DELIMITTER ? "#greenGradient" : "#redGradient"})`}
                onClick={(events) => {
                  if (events) toast(`Number of posts in ${d.key}: ${d.value}`);
                }}
                onMouseLeave={() => {
                  tooltipTimeout = window.setTimeout(() => {
                    hideTooltip();
                  }, 300);
                }}
                onMouseMove={(event) => {
                  if (tooltipTimeout) clearTimeout(tooltipTimeout);
                  const eventSvgCoords = localPoint(event);
                  const left = barX;
                  showTooltip({
                    tooltipData: d,
                    tooltipTop: eventSvgCoords?.y,
                    tooltipLeft: left,
                  });
                }}
              />
            );
          })}
        </Group>

        {/* Axis */}

        <AxisBottom
          top={yMax + margin.top + 20}
          scale={xScale}
          stroke={"#000000"}
          tickStroke={"#000000"}
          tickLabelProps={() => ({
            fill: "#000000",
            fontSize: 11,
            textAnchor: "middle",
          })}
          label={"Month"}
          labelClassName="axis-label"
        />

        <AxisLeft
          top={margin.top + 20}
          left={margin.left}
          scale={yScale}
          numTicks={Math.max(...values.map((e) => e.value))}
          stroke={"#000000"}
          tickStroke={"#000000"}
          tickLabelProps={() => ({
            fill: "#000000",
            fontSize: 11,
            textAnchor: "end",
          })}
          tickFormat={(value) => `${value}`}
          label={"Number of posts"}
          labelOffset={14}
          labelClassName="axis-label"
        />
      </svg>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          top: margin.top / 3 - 10,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "18px",
        }}
      >
        <LegendOrdinal scale={colorScale} direction="row" labelMargin="0 15px 0 0" />
        <button className="get-data-btn" onClick={handleCountData}>
          Get new data
        </button>
      </div>

      {/* Tooltip */}

      {tooltipOpen && tooltipData && (
        <TooltipInPortal top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
          <div style={{ color: tooltipData.value > DELIMITTER ? "green" : "red" }}>
            <strong>{tooltipData.key}</strong>
          </div>
          <div>Number of posts: {tooltipData.value}</div>
        </TooltipInPortal>
      )}
    </div>
  );
}
