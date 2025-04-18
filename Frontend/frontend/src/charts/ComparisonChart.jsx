import React, { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

/* metric catalogue (CSV column names must match exactly) */
const METRICS = [
  /* scale (big absolute numbers) */
  { name:'Total Revenue',           col:'Total revenue',              cat:'scale' },
  { name:'Net Profit',              col:'Net_Profit',                 cat:'scale' },
  { name:'Cost of Sales',           col:'Cost of sales',              cat:'scale' },
  { name:'Gross Profit',            col:'Gross profit',               cat:'scale' },
  { name:'Total Operating Expenses',col:'Total operating expenses',   cat:'scale' },

  /* expense */
  { name:'Selling & Distribution Exp.', col:'Selling and distribution expenses', cat:'expense' },
  { name:'Administrative Expenses',     col:'Administrative expenses',           cat:'expense' },
  { name:'Other Operating Expenses',    col:'Other operating expenses',          cat:'expense' },

  /* per‑share */
  { name:'Basic EPS',               col:'Basic_EPS',                 cat:'perShare' },
  { name:'Net Asset Per Share',     col:'Net_Assets_Per_Share',      cat:'perShare' },
  { name:'Share Count (Mn)',        col:'Share_Count_Millions',      cat:'perShare' },

  /* margin / ratio */
  { name:'Gross Profit Margin (%)', col:'Gross profit margin',       cat:'margin' }
]
const byCol = Object.fromEntries(METRICS.map(m => [m.col, m]))

/*meaningful pairing matrix */
const ALLOWED = {
  scale:    ['expense', 'margin', 'perShare'],
  expense:  ['scale',   'margin'            ],
  perShare: ['scale',   'margin'            ],
  margin:   ['scale',   'expense'           ]
}


const safe = (row, col) =>
  typeof row[col] === 'number' && !Number.isNaN(row[col]) ? row[col] : 0

const ComparisonChart = ({ year, quarter, industry, currency }) => {
  const [metricA, setMetricA] = useState('Total revenue') // default pair comparison
  const [metricB, setMetricB] = useState('Administrative expenses')
  const [chartData, setChartData] = useState(null)        //null, not {}

  /*fetch + build chart every time filters/metrics change */
  useEffect(() => {
    let url = 'http://localhost:5000/api/financials?'
    if (year)                          url += `year=${year}&`
    if (currency)                      url += `currency=${currency}&`

    fetch(url)
      .then(r => r.json())
      .then(data => {
        const labels  = data.map(d => `${d.Year}`)
        const seriesA = data.map(d => safe(d, metricA))
        const seriesB = data.map(d => safe(d, metricB))

        setChartData({
          labels,
          datasets: [
            { label: byCol[metricA].name,
              data:  seriesA,
              backgroundColor:'rgba(75,192,192,.6)' },
            { label: byCol[metricB].name,
              data:  seriesB,
              backgroundColor:'rgba(153,102,255,.6)' }
          ]
        })
      })
      .catch(err => console.error(err))
  }, [year, currency, metricA, metricB])

  /*build dropdown options */
  const optsA = METRICS.map(m =>
    <option key={m.col} value={m.col}>{m.name}</option>)

  const allowedCats = ALLOWED[byCol[metricA].cat] || []
  const optsB = METRICS
    .filter(m => allowedCats.includes(m.cat))
    .map(m => <option key={m.col} value={m.col}>{m.name}</option>)

  /*auto‑fix metricB if metricA changes and pairing becomes invalid */
  useEffect(() => {
    if (!allowedCats.includes(byCol[metricB].cat)) {
      const fallback = METRICS.find(m => allowedCats.includes(m.cat)).col
      setMetricB(fallback)
    }
  }, [metricA]) 

  return (
    <div>
      {/*selectors */}
      <div style={{display:'flex',gap:'1rem',marginBottom:'0.8rem'}}>
        <div>
          <label style={{marginRight:4}}>Metric A:</label>
          <select value={metricA} onChange={e => setMetricA(e.target.value)}>
            {optsA}
          </select>
        </div>
        <div>
          <label style={{marginRight:4}}>Metric B:</label>
          <select value={metricB} onChange={e => setMetricB(e.target.value)}>
            {optsB}
          </select>
        </div>
      </div>

      {/*chart rendered only after data is ready */}
      {chartData && (
        <Bar data={chartData}
             options={{ responsive:true,
                        plugins:{ legend:{ position:'top' } } }} />
      )}
    </div>
  )
}

export default ComparisonChart
