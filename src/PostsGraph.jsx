import React, { useMemo } from "react";
import { Bar } from "@visx/shape";
import { Group } from "@visx/group";
import { Grid } from "@visx/grid";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { LegendOrdinal } from "@visx/legend";
import { localPoint } from "@visx/event";

const defaultMargin = { top: 40, right: 0, bottom: 0, left: 0 };
const verticalMargin = 120;

export default function PostsGraph({ width, height, margin = defaultMargin, data }) {
  const count = data?.reduce((acc, date) => {
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date]++;
    return acc;
  }, {});

  console.log("count", count);

  const monthNames = new Intl.DateTimeFormat("en-US", { month: "short" });

  const getMonth = (d) => d.key;
  const getValue = (d) => d.value;

  const sortedCount = Object.entries(count ? count : {})
    ?.sort((a, b) => a[0] - b[0])
    ?.reduce((acc, [month, count]) => {
      acc[monthNames.format(new Date(`2019-${month}-01`))] = count;
      return acc;
    }, {});
  console.log("sortedCount", sortedCount);

  const values = Object.entries(sortedCount).map(([month, count]) => {
    return {
      key: month,
      value: count,
    };
  });

  // bounds
  const xMax = width;
  const yMax = height - margin.top - 100;

  // scales, memoize for performance
  const xScale = useMemo(() =>
    scaleBand(
      {
        range: [0, xMax],
        round: true,
        domain: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
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
        domain: [0, Math.max(...values.map(getValue))],
      },
      [yMax]
    )
  );

  console.log("values", values);
  const sliceFirstThree = Object.values(count ? count : {})?.slice(0, 3);

  const sliceTheRest = Object.values(count ? count : {})?.slice(3);
  const newKeysArr = [...sliceTheRest, ...sliceFirstThree];
  console.log("newKeysArr", newKeysArr);

  const tooltipStyles = {
    ...defaultStyles,
    minWidth: 60,
    backgroundColor: "rgba(0,0,0,0.9)",
    color: "white",
  };

  // scales
  const colorScale = scaleOrdinal({
    domain: ["number of posts"],
    range: ["rgba(23, 233, 217, 0.5)"],
  });

  let tooltipTimeout;

  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } = useTooltip();

  const { TooltipInPortal } = useTooltipInPortal({
    scroll: true,
  });

  xScale.rangeRound([0, xMax]);
  yScale.range([yMax + 2, 0]);

  return width < 10 ? null : (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={width} height={height} style={{ overflow: "visible" }}>
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
        <rect width={width} height={height} fill="url(#teal)" rx={14} />
        <Group top={verticalMargin / 2}>
          {values?.map((d) => {
            // console.log(d);
            const month = getMonth(d);
            const barWidth = xScale.bandwidth();
            const barHeight = yMax - (yScale(getValue(d)) ?? 0.00001);
            const barX = xScale(month);
            const barY = yMax - barHeight;
            return (
              <Bar
                key={`bar-${month}`}
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight < 0 ? 0 : barHeight}
                fill="rgba(23, 233, 217, .5)"
                onClick={(events) => {
                  if (events) alert(`clicked: ${JSON.stringify(Object.values(d))}`);
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
        />
        <AxisLeft
          top={margin.top + 20}
          left={margin.left}
          scale={yScale}
          numTicks={Math.max(...newKeysArr)}
          stroke={"#000000"}
          tickStroke={"#000000"}
          tickLabelProps={() => ({
            fill: "#000000",
            fontSize: 11,
            textAnchor: "end",
          })}
          tickFormat={(value) => `${value}`}
        />
      </svg>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          top: margin.top / 2 - 10,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          fontSize: "14px",
        }}
      >
        <LegendOrdinal scale={colorScale} direction="row" labelMargin="0 15px 0 0" />
      </div>

      {/* Tooltip */}

      {tooltipOpen && tooltipData && (
        <TooltipInPortal top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
          <div style={{ color: "rgba(23, 233, 217, 0.5)" }}>
            <strong>{tooltipData.key}</strong>
          </div>
          <div>Number of posts: {tooltipData.value}</div>
        </TooltipInPortal>
      )}
    </div>
  );
}
