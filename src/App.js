import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './App.css';

function App() {
  const [data, setData] = useState();
  useEffect(() => {
    const covidData = axios.get('https://api.bh.dev/covid')
      .then((response) => {
        if (response && response.data) {
          console.log(data);
          setData(response.data);
        } else throw('Received no data from API.');
      }).catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div className="App">
      <DataSection title="United States" data={data ? data.countryData : {}} />
      <DataSection title="Missouri" data={data ? data.stateData : {}} />
      <DataSection title="St. Louis Area" data={data ? data.countyData : {}} />
    </div>
  );
}

function DataSection({title, data}) {

  return (
    <div className="dataSection">
      <h2>{title}</h2>
      <div className="data">
        {
          data ?
          data.length
          : null
        }
      </div>
    </div>
  );
}

export default App;
