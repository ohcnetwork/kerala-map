import React from 'react';
import ReactMap from './components/ReactMap'
import Navbar from './components/Navbar'
import {useRoutes} from 'hookrouter';

const routes = {
    '/': () => <ReactMap />,
};

function App() {
  const routeResult = useRoutes(routes);
  return (
    <div className="h-screen w-screen">
      <Navbar />
     { routeResult }
    </div>
  );
}

export default App;
