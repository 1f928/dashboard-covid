import { useState, useEffect, useCallback, useRef } from 'react';
import { curveLinear } from '@visx/curve';
import { LinePath, Line } from '@visx/shape';

import useComponentSize from './util/useComponentSize';

import './CovidChart.css';

const caseColor = "#fce2a2";
const deathColor = "#df6771";
const partVaccColor = "lightgreen";
const fullVaccColor = "green";
const dateLineColor = "#eee";

const bisectData = (arr, n) => {
  if (n > 1) n = 1;
  return arr[Math.floor(arr.length * n)];
};

const formatDate = (date) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ]

  const dateNums = date.split('-');
  return `${months[parseInt(dateNums[1]) - 1]} ${dateNums[2]}, '${dateNums[0].slice(2)}`
}

export default function CovidChart({title, data, showKey}) {
  const chartRef = useRef();
  const {width} = useComponentSize(chartRef);
  const [yMultiplier, setYMultiplier] = useState(1);

  // Effect: Updates Y-scale multiplier
  useEffect(() => {
    setYMultiplier(showKey ? 0.8 : 1);
  }, [showKey]);

  const tooltipRef = useRef();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipX, setTooltipX] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const [flipTooltip, setFlipTooltip] = useState(false);
  const [tooltipWidth, setTooltipWidth] = useState(null);

  const handleTooltip = useCallback((event) => {
    const pageX = (event.type === "touchmove" || event.type === "touchstart") ?
      event.touches[0].pageX : event.pageX;
    const { left, width } = event.target.getBoundingClientRect();
    
    let x = (pageX - left) / width;
    if (x < 0) x = 0;
    if (x > 1) x = 1;
    
    setShowTooltip(true);
    setTooltipX(x);
    setTooltipData(bisectData(data, x));

    if (tooltipRef.current) {
      const {
        width: ttWidth
      } = tooltipRef.current.getBoundingClientRect();

      setTooltipWidth(ttWidth)

      if (pageX + ttWidth > left + width) {
        setFlipTooltip(true);
      } else {
        setFlipTooltip(false);
      }
    }
  }, [data]);

  const removeTooltip = useCallback(() => {
    setTooltipX(null);
    setTooltipData(null);
    setShowTooltip(false);
    setFlipTooltip(false);
    setTooltipWidth(null);
  }, []);

  const [maxCases, setMaxCases] = useState();
  const [maxDeaths, setMaxDeaths] = useState();
  const [maxDeathPct, setMaxDeathPct] = useState();
  useEffect(() => {
    setMaxCases(Math.max(...data.filter((d) => !isNaN(d.active_est) && d.active_est).map((d) => d.active_est)));
    setMaxDeaths(Math.max(...data.filter((d) => !isNaN(d.deaths_avg) && d.deaths_avg).map((d) => d.deaths_avg)));
    setMaxDeathPct(Math.max(...data.filter((d) => !isNaN(d.deaths)).map((d) => d.deaths / d.cases)));
  }, [data])

  const scaleX = (val) => val ? val / data.length : 0;

  const maxCaseValue = 0.05 * yMultiplier;
  const minCaseValue = 0.475 * yMultiplier;
  const caseDif = maxCaseValue - minCaseValue;
  const scaleCases = (val) => isNaN(val) ? minCaseValue : minCaseValue + ((val / maxCases) * caseDif);

  const minDeathValue = minCaseValue;
  const deathDif = caseDif * 0.13;
  const scaleDeaths = (val) => isNaN(val) ? minDeathValue : minDeathValue + ((val / maxDeaths) * deathDif);

  const maxVaccValue = 0.55 * yMultiplier;
  const minVaccValue = 0.95 * yMultiplier;
  const vaccDif = maxVaccValue - minVaccValue;
  const scaleVacc = (val) => isNaN(val) ? minVaccValue : minVaccValue + (val * 0.01 * vaccDif);

  const dateLines = data.map((d, i) => ({date: d.date, index: i}))
    .filter((d) => d.date.split('-').pop() === "01")
    .map((d) => d.index)
    .filter((d, i) => i % 3 === 0);

  return (
    <div
      className="covid-chart"
        ref={chartRef} 
        style={{
          fontSize: `${width / 250}em`,
          height: width
        }}
      >
      <div className="chart-title">
        <h2>{title}</h2>
      </div>
      <div className={`chart-body ${!showKey ? "full" : ""}`}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 1 ${yMultiplier}`}
          preserveAspectRatio="none"
        >

          {/* Date Lines */}
          <g>
            {dateLines.map((i) => <DateLine key={i} at={scaleX(i)} /> )}
          </g>

          {/* Data Curves */}
          <g>
            {/* Average Deaths Curve */}
            <LinePath
              curve={curveLinear}
              data={data}
              x={(_, i) => scaleX(i)}
              y={(d) => scaleDeaths(d.deaths_avg) || 0}
              stroke={deathColor}
              strokeWidth={0.005}
            />

            {/* Average Cases Curve */}
            <LinePath
              curve={curveLinear}
              data={data}
              x={(_, i) => scaleX(i)}
              y={(d) => scaleCases(d.active_est) || 0}
              stroke={caseColor}
              strokeWidth={0.005}
            />

            {/* Fully Vaccinated Curve */}
            <LinePath
              curve={curveLinear}
              data={data}
              x={(_, i) => scaleX(i)}
              y={(d) => scaleVacc(d.pvacc_pct)}
              stroke={partVaccColor}
              strokeWidth={0.005}
            />
            
            {/* Partially Vaccinated Curve */}
            <LinePath
              curve={curveLinear}
              data={data}
              x={(_, i) => scaleX(i)}
              y={(d) => scaleVacc(d.fvacc_pct)}
              stroke={fullVaccColor}
              strokeWidth={0.005}
            />
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
              cy={scaleCases(tooltipData.active_est) || 2}
              r={0.01}
              fill="white"
              stroke={caseColor}
              strokeWidth="0.005"
            />
            <circle
              cx={tooltipX}
              cy={scaleDeaths(tooltipData.deaths_avg) || 2}
              r={0.01}
              fill="white"
              stroke={deathColor}
              strokeWidth="0.005"
            />
            <circle
              cx={tooltipX}
              cy={scaleVacc(tooltipData.pvacc_pct)}
              r={0.01}
              fill="white"
              stroke={partVaccColor}
              strokeWidth="0.005"
            />
            <circle
              cx={tooltipX}
              cy={scaleVacc(tooltipData.fvacc_pct)}
              r={0.01}
              fill="white"
              stroke={fullVaccColor}
              strokeWidth="0.005"
            />
          </g>
          : null}


          {/* For some reason, having this on SVG leads to occlusion issues */}
          <rect
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => removeTooltip()}
            width={1}
            height={1}
            fillOpacity={0}
          />
        </svg>
        {showTooltip && tooltipData ?
        <>
        <div
          className="tooltip info"
          ref={tooltipRef}
          style={{
            top: `calc(${40 * yMultiplier}%)`,
            left: flipTooltip
              ? `calc(${tooltipX * 94}% - ${tooltipWidth}px)`
              : `calc(${tooltipX * 94}% + 2em)` 
          }}
        >
          <p>{formatDate(tooltipData.date)}:</p>
          <div className="tooltip-row">
            <div className="tooltip-key" style={{backgroundColor: caseColor}} />
            <div>
              <p>active: {tooltipData.active_est}</p>
              <p>pmax: {(tooltipData.active_est * 100 / maxCases).toFixed(2)}%</p>
            </div>
          </div>
          <div className="tooltip-row">
            <div className="tooltip-key" style={{backgroundColor: deathColor}} />
            <div>
              <p>death rate: {(tooltipData.deaths * 100 / tooltipData.cases).toFixed(2)}%</p>
              <p>pmax: {((tooltipData.deaths * 100 / tooltipData.cases) / maxDeathPct).toFixed(2)}%</p>
            </div>
          </div>
          <div className="tooltip-row">
            <div className="tooltip-key" style={{backgroundColor: partVaccColor}} />
            <div>
              <p>percent: {(tooltipData.pvacc_pct || 0).toFixed(2)}%</p>
            </div>
          </div>
          <div className="tooltip-row">
            <div className="tooltip-key" style={{backgroundColor: fullVaccColor}} />
            <div>
              <p>percent: {(tooltipData.fvacc_pct || 0).toFixed(2)}%</p>
            </div>
          </div>
        </div>
        <div
          className="tooltip date"
          style={{
            top: `calc(${95 * yMultiplier}%)`,
            left: `calc(${tooltipX * 96}% - 2em)`
          }}
        >
          {formatDate(tooltipData.date)}
        </div>
        </>
        : null}
      </div>
      {showKey ?
      <div className="chart-info">
        <LegendItem color={caseColor} value="Est. Active Cases" />
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
      strokeDasharray=".015, .01"
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

// TODO: Pick a consistent font
// TODO: Set boundaries for tooltip
// TODO: Add lines for vacc %s (50%, 80%, 100%)(?)