import React from "react";
import { BarStack } from "@visx/shape";
import { SeriesPoint } from "@visx/shape/lib/types";
import { Group } from "@visx/group";
import { Grid } from "@visx/grid";
import { AxisBottom } from "@visx/axis";
import cityTemperature, { CityTemperature } from "@visx/mock-data/lib/mocks/cityTemperature";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { timeParse, timeFormat } from "d3-time-format";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { LegendOrdinal } from "@visx/legend";
import { localPoint } from "@visx/event";
import { allPostsData } from "./App";

const defaultMargin = { top: 40, right: 0, bottom: 0, left: 0 };

export default function Example({ width, height, events = false, margin = defaultMargin, data, formattedDate }) {
  console.log(data);
  console.log("in example", formattedDate);
  const purple1 = "#6c5efb";
  const purple2 = "#c998ff";
  const purple3 = "#a44afe";
  const background = "#eaedff";

  const tooltipStyles = {
    ...defaultStyles,
    minWidth: 60,
    backgroundColor: "rgba(0,0,0,0.9)",
    color: "white",
  };
  const keys = Object.keys(data[0]).filter(
    (d) => d !== "__typename" && d !== "id" && d !== "title" && d !== "body" && d !== "published" && d !== "author"
  );

  //   console.log("keys", keys);

  const parseDate = timeParse("%Y-%m-%d");
  const format = timeFormat("%b %d");
  // const formatDate = (date) => format(parseDate(date));

  const parsedDates = formattedDate.map((date) => new Date(date).getMonth());
  const uniqueDates = Array.from(new Set(parsedDates));
  console.log("uniqueDates", uniqueDates);
  console.log("parsedDates", parsedDates);

  // const formatDate = (date) => format(parseDate(uniqueDates[date - 1]));
  // const formatDate = (date) => `${date}`;

  const formatDate = (date) => new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(0, date));

  // accessors
  const getDate = (d) => d.date;

  // scales
  const dateScale = scaleBand({
    domain: uniqueDates,
    padding: 0.2,
  });

  function countPostsPerMonth(dates) {
    const monthCounts = {
      "01": 0,
      "02": 0,
      "03": 0,
      "04": 0,
      "05": 0,
      "06": 0,
      "07": 0,
      "08": 0,
      "09": 0,
      10: 0,
      11: 0,
      12: 0,
    };

    dates.forEach((date) => {
      // console.log("date in for each", date);
      const month = date.slice(5, 7);
      // console.log("month", month);
      const result = monthCounts[month]++;
      console.log("result", result);
    });

    const keys = Object.keys(monthCounts);
    const sorted = keys.sort((a, b) => a - b);

    const sortedMonthCounts = {};
    sorted.forEach((key) => {
      sortedMonthCounts[key] = monthCounts[key];
    });

    return sortedMonthCounts;
  }

  const count = formattedDate.reduce((acc, date) => {
    const month = date.substring(5, 7);
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month]++;
    return acc;
  }, {});

  console.log("each month count", count);

  const monthCounts = countPostsPerMonth(formattedDate);
  console.log("monthCounts", monthCounts);

  console.log("keys", Object.keys(monthCounts));
  console.log("values", Object.values(monthCounts));

  const sliceFirstThree = Object.values(monthCounts).slice(0, 3);

  const sliceTheRest = Object.values(monthCounts).slice(3);
  const newKeysArr = [...sliceTheRest, ...sliceFirstThree];
  console.log("newKeysArr", newKeysArr);

  const temperatureScale = scaleLinear({
    // scale -> need to get max value of posts in the day
    domain: [0, Math.max(...data)],
    nice: true,
  });
  const colorScale = scaleOrdinal({
    domain: keys,
    range: [purple1, purple2, purple3],
  });

  let tooltipTimeout;

  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } = useTooltip();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    // TooltipInPortal is rendered in a separate child of <body /> and positioned
    // with page coordinates which should be updated on scroll. consider using
    // Tooltip or TooltipWithBounds if you don't need to render inside a Portal
    scroll: true,
  });

  if (width < 10) return null;
  // bounds
  const xMax = width;
  const yMax = height - margin.top - 100;

  dateScale.rangeRound([0, xMax]);
  temperatureScale.range([yMax, 0]);

  return width < 10 ? null : (
    <div style={{ position: "relative" }}>
      <svg ref={containerRef} width={width} height={800}>
        <rect x={0} y={0} width={width} height={800} fill={background} rx={14} />
        <Grid
          top={margin.top}
          left={margin.left}
          xScale={dateScale}
          yScale={temperatureScale}
          width={xMax}
          height={yMax}
          stroke="black"
          strokeOpacity={0.1}
          xOffset={dateScale.bandwidth() / 2}
        />
        <Group top={margin.top}>
          <BarStack data={data} keys={keys} x={getDate} xScale={dateScale} yScale={temperatureScale} color={colorScale}>
            {(barStacks) =>
              barStacks.map((barStack) =>
                barStack.bars.map((bar) => (
                  <rect
                    key={`bar-stack-${barStack.index}-${bar.index}`}
                    x={bar.x}
                    y={bar.y}
                    height={bar.height}
                    width={bar.width}
                    fill={bar.color}
                    onClick={() => {
                      if (events) alert(`clicked: ${JSON.stringify(bar)}`);
                    }}
                    onMouseLeave={() => {
                      tooltipTimeout = window.setTimeout(() => {
                        hideTooltip();
                      }, 300);
                    }}
                    onMouseMove={(event) => {
                      if (tooltipTimeout) clearTimeout(tooltipTimeout);
                      // TooltipInPortal expects coordinates to be relative to containerRef
                      // localPoint returns coordinates relative to the nearest SVG, which
                      // is what containerRef is set to in this example.
                      const eventSvgCoords = localPoint(event);
                      const left = bar.x + bar.width / 2;
                      showTooltip({
                        tooltipData: bar,
                        tooltipTop: eventSvgCoords?.y,
                        tooltipLeft: left,
                      });
                    }}
                  />
                ))
              )
            }
          </BarStack>
        </Group>
        <AxisBottom
          top={yMax + margin.top}
          scale={dateScale}
          tickFormat={formatDate}
          // tickFormat={(value) => value}
          stroke={purple3}
          tickStroke={purple3}
          tickLabelProps={() => ({
            fill: purple3,
            fontSize: 11,
            textAnchor: "middle",
          })}
        />
      </svg>
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

      {tooltipOpen && tooltipData && (
        <TooltipInPortal top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
          <div style={{ color: colorScale(tooltipData.key) }}>
            <strong>{tooltipData.key}</strong>
          </div>
          <div>{tooltipData.bar.data[tooltipData.key]}℉</div>
          <div>
            <small>{formatDate(getDate(tooltipData.bar.data))}</small>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}
