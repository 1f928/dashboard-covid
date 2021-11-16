import { useState, useEffect } from 'react';
import { curveCatmullRom, curveLinear } from '@visx/curve';
import { LinePath, AreaClosed } from '@visx/shape';

import './CovidChart.css';

export default function CovidChart({title, data, showKey, size}) {
  const [fontSize, setFontSize] = useState();
  useEffect(() => {
    setFontSize(`${size / 250}em`)
  }, [size]);

  const [maxCases, setMaxCases] = useState();
  const [maxDeaths, setMaxDeaths] = useState();
  useEffect(() => {
    setMaxCases(Math.max(...data.map((d) => d.cases_avg)));
    setMaxDeaths(Math.max(...data.map((d) => d.deaths_avg)));
  }, [data])

  const scaleX = (val) => val / data.length;

  const maxCaseValue = 0.05;
  const minCaseValue = 0.5;
  const caseDif = maxCaseValue - minCaseValue; // -0.45
  const scaleCases = (val) => minCaseValue + ((val / maxCases) * caseDif);
  const maxDeathValue = 0.44;
  const minDeathValue = 0.5;
  const deathDif = caseDif * 0.15;
  const scaleDeaths = (val) => minDeathValue + ((val / maxDeaths) * deathDif);
  const scaleVacc = (val) => null;

  return (
    <div style={{width: size, height: size, fontSize: fontSize}} className="covid-chart">
      <div className="chart-title">
        <h2>{title}</h2>
      </div>
      <div className={`chart-body ${!showKey ? "full" : ""}`}>
        <svg width="100%" height="100%" viewBox="0 0 1 1" preserveAspectRatio="none">

          {/* Average Deaths Curve */}
          <LinePath
            curve={curveCatmullRom}
            data={data}
            x={(d, i) => scaleX(i)}
            y={(d) => scaleDeaths(d.deaths_avg)}
            stroke="#f00"
            strokeWidth="0.005"
          />

          {/* Average Cases Curve */}
          <LinePath
            curve={curveCatmullRom}
            data={data}
            x={(d, i) => scaleX(i)}
            y={(d) => scaleCases(d.cases_avg)}
            stroke="#fce2a2"
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

        </svg>
      </div>
      {showKey ?
      <div className="chart-info"></div>
      : null}
    </div>
  )
}