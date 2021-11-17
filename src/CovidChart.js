import { useState, useEffect, useCallback } from 'react';
import { curveCatmullRom, curveLinear } from '@visx/curve';
import { LinePath, Line } from '@visx/shape';

import './CovidChart.css';

const caseColor = "#fce2a2";
const deathColor = "#df6771";
const partVaccColor = "";
const fullVaccColor = "";
const dateLineColor = "#eee";

const bisectData = (arr, n) => {
  if (n > 1) n = 1;
  return arr[Math.floor(arr.length * n)];
};

export default function CovidChart({title, data, showKey, size}) {
  const [fontSize, setFontSize] = useState();
  useEffect(() => {
    setFontSize(`${size / 250}em`)
  }, [size]);

  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipX, setTooltipX] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);

  const handleTooltip = useCallback((event) => {
    const pageX = (event.type === "touchmove" || event.type === "touchstart") ?
      event.touches[0].pageX : event.pageX;
    const { left } = event.target.getBoundingClientRect();
    if (pageX > left + 10) { // couldn't find out what was causing the strange behavior, so killing it here
      const x = (pageX - left) / size;
      
      if (!showTooltip) setShowTooltip(true);
      setTooltipX(x);
      setTooltipData(bisectData(data, x));
    }
  });

  const removeTooltip = useCallback(() => {
    setTooltipX(null);
    setTooltipData(null);
    setShowTooltip(false);
  });

  const [maxCases, setMaxCases] = useState();
  const [maxDeaths, setMaxDeaths] = useState();
  useEffect(() => {
    setMaxCases(Math.max(...data.map((d) => d.cases_avg)));
    setMaxDeaths(Math.max(...data.map((d) => d.deaths_avg)));
  }, [data])

  const scaleX = (val) => val / data.length;

  const maxCaseValue = 0.05;
  const minCaseValue = 0.475;
  const caseDif = maxCaseValue - minCaseValue;
  const scaleCases = (val) => minCaseValue + ((val / maxCases) * caseDif);

  const minDeathValue = 0.475;
  const deathDif = caseDif * 0.13;
  const scaleDeaths = (val) => minDeathValue + ((val / maxDeaths) * deathDif);

  const scaleVacc = (val) => null;

  const dateLines = data.map((d, i) => ({date: d.date, index: i}))
    .filter((d) => d.date.split('-').pop() === "01")
    .map((d) => d.index)
    .filter((d, i) => i % 3 === 0);

  return (
    <div style={{width: size, height: size, fontSize: fontSize}} className="covid-chart">
      <div className="chart-title">
        <h2>{title}</h2>
      </div>
      <div className={`chart-body ${!showKey ? "full" : ""}`}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
          onTouchStart={handleTooltip}
          onTouchMove={handleTooltip}
          onMouseMove={handleTooltip}
          onMouseLeave={() => removeTooltip()}
        >

          {/* Date Lines */}
          <g>
            {dateLines.map((i) => <DateLine key={i} at={scaleX(i)} /> )}
          </g>

          {/* Data Curves */}
          <g>
            {/* Average Deaths Curve */}
            <LinePath
              curve={curveCatmullRom}
              data={data}
              x={(d, i) => scaleX(i)}
              y={(d) => scaleDeaths(d.deaths_avg)}
              stroke={deathColor}
              strokeWidth="0.005"
            />

            {/* Average Cases Curve */}
            <LinePath
              curve={curveCatmullRom}
              data={data}
              x={(d, i) => scaleX(i)}
              y={(d) => scaleCases(d.cases_avg)}
              stroke={caseColor}
              strokeWidth="0.005"
            />

            {/* Fully Vaccinated Curve */}
            {/* <LinePath
              curve={}
              data={}
              x={}
              y={}
              stroke={}
              strokeWidth={}
            /> */}
            
            {/* Partially Vaccinated Curve */}
            {/* <LinePath
              curve={}
              data={}
              x={}
              y={}
              stroke={}
              strokeWidth={}
            /> */}
          </g>

          {showTooltip ?
          <g>
            <Line
              from={{ x: tooltipX, y: 0 }}
              to={{ x: tooltipX, y: 1 }}
              stroke={dateLineColor}
              strokeWidth="0.005"
            />
            <circle
              cx={tooltipX}
              cy={scaleCases(tooltipData.cases_avg)}
              r={0.01}
              fill="white"
              stroke={caseColor}
              strokeWidth="0.005"
            />
            <circle
              cx={tooltipX}
              cy={scaleDeaths(tooltipData.deaths_avg)}
              r={0.01}
              fill="white"
              stroke={deathColor}
              strokeWidth="0.005"
            />
          </g>
          : null}

        </svg>
        {showTooltip ?
        <>
        <div
          className="tooltip info"
          style={{
            top: `calc(-2em + ${.5 * (size * (showKey ? .8 : 1))}px)`,
            left: `calc(1.5em + ${tooltipX * size}px)`
          }}
        >
          <p>current cases and percent of max</p>
          <p>running total death %</p>
        </div>
        <div
          className="tooltip date"
          style={{
            top: `calc(.2em + ${1 * (size * (showKey ? .8 : 1))}px)`,
            left: `calc(-2em + ${tooltipX * size}px)`
          }}
        >
          {tooltipData.date}
        </div>
        </>
        : null}
      </div>
      {showKey ?
      <div className="chart-info">
        <LegendItem color={caseColor} value="Average Cases" />
        <LegendItem color={deathColor} value="Average Deaths" />
        <LegendItem color={partVaccColor} value="Partially Vaccinated" />
        <LegendItem color={fullVaccColor} value="Fully Vaccinated" />
      </div>
      : null}
    </div>
  )
}

function DateLine({at}) {
  return (
    <Line
      from={{ x: at, y: 0 }}
      to={{ x: at, y: 1 }}
      stroke={dateLineColor}
      strokeWidth="0.002"
      strokeDasharray=".015,.01"
    />
  );
}

function LegendItem({color, value}) {
  return (
    <div className="legend-item">
      <div className="legend-key" style={{backgroundColor: color}} />
      <span className="legend-value">{value}</span>
    </div>
  );
}

// TODO: Actually fix offset bad values
// TODO: Pick a consistent font