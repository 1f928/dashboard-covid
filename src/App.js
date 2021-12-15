import React, { useState, useEffect } from 'react';
import axios from 'axios';

import CovidChart from './CovidChart';

import './App.css';

function App() {
  const [data, setData] = useState([]);
  useEffect(() => {
    axios.get('https://api.bh.dev/covid')
    // axios.get('http://localhost:3100')
      .then((response) => {
        if (response && response.data) {
          setData(transformData(response.data));
        } else Promise.reject('Received no data from API.');
      }).catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div className="App">
      <div className="container">
      {canMap(data)
        ? data.map((region, i) => 
          <CovidChart
            title={region.name}
            data={region.data}
            showKey={i === -1}
            key={region.name}
          />
        )
        : null
      }
      </div>
    </div>
  );
}

function transformData(data) {
  const country = canMap(data.countries)
    ? transformSet(data.countries[0], 'country')
    : null;

  const state = canMap(data.states)
    ? transformSet(data.states[0], 'state')
    : null;

  const counties = canMap(data.counties)
    ? data.counties.map((set) => transformSet(set, 'county'))
    : [null];

  return [country, state, ...counties];
}

function transformSet(set, keyName) {
  const {
    keys: {[keyName]: name},
    rows: data
  } = set;

  return {name, data};
}

function canMap(obj) {
  return (
    obj && 
    typeof obj.map === 'function' &&
    obj.length > 0
  );
}

export default App;
