import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const GrossProfitMarginChart = ({ year, currency, events, onDrillDown }) => {
  const [chartData, setChartData]     = useState({ labels: [], datasets: [] })
  const [chartOptions, setChartOptions] = useState({})

  useEffect(() => {
    let url = 'http://localhost:5000/api/financials?'
    if (year)     url += `year=${year}&`
    if (currency) url += `currency=${currency}&`

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const labels = data.map(d => `${d.Year}`)
        const gpm    = data.map(d => d['Gross profit margin'])

        // YoY Growth calculation
        const yoy = [null]
        for (let i = 1; i < gpm.length; i++) {
          yoy.push(((gpm[i] - gpm[i - 1]) / gpm[i - 1]) * 100)
        }

        //events
        const eventMap = {}
        if (Array.isArray(events)) {
          events.forEach(e => {
            if (e?.year && e?.description) {
              eventMap[e.year] = e.description
            }
          })
        }

        setChartData({
          labels,
          datasets: [
            {
              label: 'Gross Profit Margin (%)',
              data: gpm,
              borderColor: 'orange',
              backgroundColor: 'rgba(255, 165, 0, 0.2)',
              tension: 0.3,
              fill: true
            }
          ]
        })

        setChartOptions({
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: ctx => {
                  const i   = ctx.dataIndex
                  const val = gpm[i]
                  const yr  = labels[i]
                  // format value with commas + 2 decimals
                  const formattedVal = val.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })
                  const growth = yoy[i]
                  let line = growth != null
                    ? `GPM: ${formattedVal}% | YoY Growth: ${growth.toFixed(1)}%`
                    : `GPM: ${formattedVal}%`
                  if (eventMap[yr]) {
                    line += ` | ${eventMap[yr]}`
                  }
                  return line
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Year'
              }
            },
            y: {
              title: {
                display: true,
                text: 'GPM (%)'
              },
              ticks: {
                callback: value =>
                  value.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }) + '%'
              }
            }
          },
          onClick: (evt, elements) => {
            if (elements.length > 0) {
              const idx = elements[0].index
              const dataPoint = {
                year: data[idx].Year,
                gpm:  data[idx]['Gross profit margin']
              }
              onDrillDown?.(dataPoint)
            }
          }
        })
      })
      .catch(err => console.error(err))
  }, [year, currency, events, onDrillDown])

  return <Line data={chartData} options={chartOptions} />
}

export default GrossProfitMarginChart
