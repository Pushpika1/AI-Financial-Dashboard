import React from 'react'

const FilterBar = ({
  selectedYear, setSelectedYear,
  selectedCurrency, setSelectedCurrency
}) => {
  const handleYearChange = (e) => setSelectedYear(e.target.value)
  const handleCurrencyChange = (e) => setSelectedCurrency(e.target.value)

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label>Year:</label>
        <select value={selectedYear || ''} onChange={handleYearChange}>
          <option value="">All</option>
          <option value="2020">2020</option>
          <option value="2021">2021</option>
          <option value="2022">2022</option>
          <option value="2023">2023</option>
          <option value="2024">2024</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Currency:</label>
        <select value={selectedCurrency} onChange={handleCurrencyChange}>
          <option value="LKR">LKR</option>
          <option value="USD">USD</option>
        </select>
      </div>
    </div>
  )
}

export default FilterBar
