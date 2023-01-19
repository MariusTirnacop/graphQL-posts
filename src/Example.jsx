import React, { useMemo } from "react";
import { Bar, BarStack } from "@visx/shape";
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
const verticalMargin = 120;

export default function Example({ width, height, events = false, margin = defaultMargin, data, formattedDate }) {
  console.log(data);
  console.log("in example", formattedDate);
  const purple1 = "#6c5efb";
  const purple2 = "#c998ff";
  const purple3 = "#a44afe";
  const background = "#eaedff";

  const count = formattedDate?.reduce((acc, date) => {
    const month = `0${date.substring(5, 7)}`.slice(-2);
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month]++;
    return acc;
  }, {});

  const monthNames = new Intl.DateTimeFormat("en-US", { month: "short" });

  const getMonth = (d) => d.key;
  const getValue = (d) => d.value;

  const sortedCount = Object.entries(count ? count : {})
    ?.sort((a, b) => a[0] - b[0])
    .reduce((acc, [month, count]) => {
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
        domain: values.map(getMonth),
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

  const temperatureScale = scaleLinear({
    // scale -> need to get max value of posts in the day
    domain: [0, Math.max(...newKeysArr)],
    nice: true,
  });

  const tooltipStyles = {
    ...defaultStyles,
    minWidth: 60,
    backgroundColor: "rgba(0,0,0,0.9)",
    color: "white",
  };
  const logme = Object.values(sortedCount);
  console.log("logme", logme);

  const keys = Object.values(sortedCount).map((value) => value);

  const colorScale = scaleOrdinal({
    domain: keys,
    range: [purple1, purple2, purple3],
  });

  //   console.log("keys", keys);

  const parseDate = timeParse("%Y-%m-%d");
  const format = timeFormat("%b %d");
  // const formatDate = (date) => format(parseDate(date));

  const parsedDates = formattedDate?.map((date) => new Date(date).getMonth());
  const uniqueDates = Array.from(new Set(parsedDates));
  console.log("uniqueDates", uniqueDates);
  console.log("parsedDates", parsedDates);

  // const formatDate = (date) => format(parseDate(uniqueDates[date - 1]));
  // const formatDate = (date) => `${date}`;

  const formatDate = (date) => new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(0, date));
  // console.log("formatDate", formatDate(new Date()));
  // accessors
  const getDate = (d) => d.date;

  // scales
  const dateScale = scaleBand({
    domain: uniqueDates,
    padding: 0,
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

  dateScale.rangeRound([0, xMax]);
  temperatureScale.range([yMax, 0]);

  return width < 10 ? null : (
    <div style={{ position: "relative" }}>
      {/* <svg ref={containerRef} width={width} height={800}>
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
        
      </svg> */}
      <svg width={width} height={height}>
        {/* <GradientTealBlue id="teal" /> */}
        <Grid
          top={margin.top + 20}
          left={margin.left}
          xScale={dateScale}
          yScale={temperatureScale}
          width={xMax}
          height={yMax}
          stroke="black"
          strokeOpacity={0.1}
          xOffset={dateScale.bandwidth() / 2}
        />
        <rect width={width} height={height} fill="url(#teal)" rx={14} />
        <Group top={verticalMargin / 2}>
          {values?.map((d) => {
            console.log(d);
            const letter = getMonth(d);
            const barWidth = xScale.bandwidth();
            const barHeight = yMax - (yScale(getValue(d)) ?? 0);
            const barX = xScale(letter);
            const barY = yMax - barHeight;
            // console.log("barX", barX);
            // console.log("barY", barY);
            // console.log("Bar width", barWidth);
            // console.log("barHeight", barHeight);
            return (
              <Bar
                key={`bar-${letter}`}
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
                  // TooltipInPortal expects coordinates to be relative to containerRef
                  // localPoint returns coordinates relative to the nearest SVG, which
                  // is what containerRef is set to in this example.
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
        <AxisBottom
          top={yMax + margin.top + 20}
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
          <div style={{ color: colorScale(tooltipData) }}>
            {/* <div> */}
            <strong>{tooltipData.key}</strong>
          </div>
          <div>Number of posts: {tooltipData.value}</div>

          <div>{/* <small>{formatDate(getDate(tooltipData.key))}</small> */}</div>
        </TooltipInPortal>
      )}
    </div>
  );
}
