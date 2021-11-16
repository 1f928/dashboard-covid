import React, { useState, useEffect } from 'react';
import axios from 'axios';

import CovidChart from './CovidChart';

import './App.css';

function App() {
  const [data, setData] = useState({});
  useEffect(() => {
    axios.get('https://api.bh.dev/covid')
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
      <CovidChart
        title="Missouri"
        data={data.states ? data.states[0].rows : []}
        showKey={true}
        size={500}
      />
      <CovidChart
        title="USA"
        data={data.countries ? data.countries[0].rows : []}
        showKey={false}
        size={400}
      />
    </div>
  );
}

export default App;
