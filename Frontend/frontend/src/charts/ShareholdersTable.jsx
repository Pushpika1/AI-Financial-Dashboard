import React, { useEffect, useState } from 'react'
import { Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const ShareholdersTable = () => {
  const [allData, setAllData] = useState([])
  const [selectedYear, setSelectedYear] = useState('2020')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState('Shareholder')
  const [sortDirection, setSortDirection] = useState('asc')

  useEffect(() => {
    fetch('http://localhost:5000/api/shareholders')
      .then(res => res.json())
      .then(data => {
        setAllData(data)
      })
      .catch(err => console.error(err))
  }, [])

  const yearColumn = `${selectedYear} (%)`

  //filter & Sort logic
  let filtered = allData.filter((row) => {
    const val = row[yearColumn]
    if (val === undefined || val === null || val <= 0) return false
    if (!row.Shareholder.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  filtered.sort((a, b) => {
    if (sortColumn === 'Shareholder') {
      const nameA = a.Shareholder.toLowerCase()
      const nameB = b.Shareholder.toLowerCase()
      if (nameA < nameB) return sortDirection === 'asc' ? -1 : 1
      if (nameA > nameB) return sortDirection === 'asc' ? 1 : -1
      return 0
    } else {
      const valA = a[yearColumn]
      const valB = b[yearColumn]
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1
      return 0
    }
  })

  filtered = filtered.slice(0, 20) // top 20

  //pie chart data
  const pieData = {
    labels: filtered.map(item => item.Shareholder),
    datasets: [
      {
        label: `${selectedYear} (%)`,
        data: filtered.map(item => item[yearColumn]),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
          '#9966FF', '#FF9F40', '#FF6B6B', '#48C774',
          '#BB86FC', '#03DAC6', '#BDB76B', '#E9967A',
          '#8FBC8F', '#CD5C5C', '#6B8E23', '#4682B4',
          '#D2691E', '#808000', '#C71585', '#DC143C'
        ]
      }
    ]
  }


  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 30,
        right: 20
      }
    },
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          padding: 4,          
          boxHeight: 12,       
          font: { size: 12 }   
        }
      }
    }
  }

  const handleSort = (col) => {
    if (sortColumn === col) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(col)
      setSortDirection('asc')
    }
  }

  return (
    <div>
      {/*filters */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
        <div>
          <label style={{ marginRight: '0.5rem' }}><strong>Year:</strong></label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{ padding: '4px' }}
          >
            <option value="2020">2020</option>
            <option value="2021">2021</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
          </select>
        </div>
        <div>
          <label style={{ marginRight: '0.5rem' }}><strong>Search:</strong></label>
          <input
            type="text"
            placeholder="Shareholder name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '4px' }}
          />
        </div>
      </div>

      {/*pie chart */}
      <div style={{ width: '100%', height: '350px', marginBottom: '2rem' }}>
        <Pie data={pieData} options={pieOptions} />
      </div>

      {/*table */}
      <div className="shareholder-table-container">
        <table className="shareholder-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('Shareholder')}>
                Shareholder
                {sortColumn === 'Shareholder' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
              </th>
              <th onClick={() => handleSort(yearColumn)}>
                {selectedYear} (%)
                {sortColumn === yearColumn && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => (
              <tr key={idx}>
                <td>{row.Shareholder}</td>
                <td>{row[yearColumn]}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="2" style={{ textAlign: 'center', color: '#888' }}>
                  No matching shareholders
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ShareholdersTable
