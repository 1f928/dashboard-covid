import React, { useState, useEffect } from 'react';
import axios from 'axios';

import CovidChart from './CovidChart';

import './App.css';

function App() {
  const [data, setData] = useState({});
  useEffect(() => {
    axios.get('https://api.bh.dev/covid')
    // axios.get('http://localhost:3100')
      .then((response) => {
        if (response && response.data) {
          setData(response.data);
        } else Promise.reject('Received no data from API.');
      }).catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div className="App">
      <div className="country-state">
        <CovidChart
          title="USA"
          data={data.countries ? data.countries[0].rows : []}
          showKey={true}
          size={600}
        />
        <CovidChart
          title="Missouri"
          data={data.states ? data.states[0].rows : []}
          showKey={false}
          size={600}
        />
      </div>
      <div className="county">
        {data.counties ? data.counties.map((county) =>
        <CovidChart
          title={county.keys.county}
          data={county.rows}
          showKey={false}
          size={400}
          key={county.keys.county}
        />
        ) : null}
      </div>

    </div>
  );
}

export default App;
