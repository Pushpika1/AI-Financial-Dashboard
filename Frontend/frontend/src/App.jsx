import React, { useState } from 'react'
import FilterBar from './charts/FilterBar'
import RevenueChart from './charts/RevenueChart'
import EPSChart from './charts/EPSChart'
import CostVsOpExChart from './charts/CostVsOpExChart'
import GrossProfitMarginChart from './charts/GrossProfitMarginChart'
import NetAssetChart from './charts/NetAssetChart'
import ComparisonChart from './charts/ComparisonChart'
import ShareholdersTable from './charts/ShareholdersTable'
import DarkLightToggle from './ui/DarkLightToggle'
import ExportButtons from './ui/ExportButtons'
import DrillDownModal from './DrillDownModal'
import { events } from './events';

function App() {
  const [selectedYear, setSelectedYear] = useState(null)
  const [selectedCurrency, setSelectedCurrency] = useState('LKR')
  const [drillDownData, setDrillDownData] = useState(null)


  const handleDrillDown = (dataPoint) => {
    setDrillDownData(dataPoint)
  }

  const handleCloseModal = () => {
    setDrillDownData(null)
  }

  return (
    <div id="dashboard-container" className="page-container">
      <div className="navbar">
        <h1 className="title">John Keells Holdings PLC</h1>
        <div className="navbar-right">
          <DarkLightToggle />
          <ExportButtons />
        </div>
      </div>

      <FilterBar
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
      />

      <div className="grid-container">
        <div className="card">
          <h2 className="card-title">Total Revenue</h2>
          <RevenueChart
            year={selectedYear}
            currency={selectedCurrency}
            events={events}    
            onDrillDown={handleDrillDown}
          />
        </div>

        <div className="card">
          <h2 className="card-title">Earnings Per Share (EPS)</h2>
          <EPSChart
            year={selectedYear}
            currency={selectedCurrency}
            events={events}
            onDrillDown={handleDrillDown}
          />
        </div>

        <div className="card">
          <h2 className="card-title">Cost of Sales vs. Operating Expenses</h2>
          <CostVsOpExChart
            year={selectedYear}
            currency={selectedCurrency}
            events={events}
            onDrillDown={handleDrillDown}
          />
        </div>

        <div className="card">
          <h2 className="card-title">Gross Profit Margin (GPM)</h2>
          <GrossProfitMarginChart
            year={selectedYear}
            currency={selectedCurrency}
            events={events}
            onDrillDown={handleDrillDown}
          />
        </div>

        <div className="card">
          <h2 className="card-title">Net Asset Per Share</h2>
          <NetAssetChart
            year={selectedYear}
            currency={selectedCurrency}
            events={events}
            onDrillDown={handleDrillDown}
          />
        </div>

        <div className="card wide">
          <h2 className="card-title">Comparison Tool</h2>
          <ComparisonChart
            year={selectedYear}
            currency={selectedCurrency}
          />
        </div>

        <div className="card wide">
          <h2 className="card-title">Top 20 Shareholders</h2>
          <ShareholdersTable />
        </div>
      </div>

      {drillDownData && (
        <DrillDownModal data={drillDownData} onClose={handleCloseModal} />
      )}
    </div>
    
  )
}

export default App
