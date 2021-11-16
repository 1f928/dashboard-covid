import { useState, useEffect, useCallback } from 'react';
import { curveCatmullRom, curveLinear } from '@visx/curve';
import { LinePath, Line } from '@visx/shape';

import './CovidChart.css';

const caseColor = "#fce2a2";
const deathColor = "#df6771";
const partVaccColor = "";
const fullVaccColor = "";
const dateLineColor = "#eee";

export default function CovidChart({title, data, showKey, size}) {
  const [fontSize, setFontSize] = useState();
  useEffect(() => {
    setFontSize(`${size / 250}em`)
  }, [size]);

  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipX, setTooltipX] = useState(null);

  const handleTooltip = (event) => {
    if (!showTooltip) setShowTooltip(true);
    const { left } = event.target.getBoundingClientRect();
    const { pageX } = event
    const x = (pageX - left) / size;
    setTooltipX(x);
  };
  console.log(tooltipX);

  const removeTooltip = () => {
    setTooltipX(null);
    setShowTooltip(false);
  };
  console.log(showTooltip);

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
  const deathDif = caseDif * 0.15;
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
          </g>
          : null}

        </svg>
      </div>
      {showKey ?
      <div className="chart-info">
        <LegendItem color={caseColor} value="Average Cases" />
        <LegendItem color={deathColor} value="Average Deaths" />
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
