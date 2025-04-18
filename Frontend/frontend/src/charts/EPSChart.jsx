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

const EPSChart = ({ year, currency, events, onDrillDown }) => {
  const [chartData, setChartData]     = useState({ labels: [], datasets: [] })
  const [chartOptions, setChartOptions] = useState({})

  useEffect(() => {
    let url = 'http://localhost:5000/api/financials?'
    if (year)     url += `year=${year}&`
    if (currency) url += `currency=${currency}&`

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const labels     = data.map(d => `${d.Year}`)
        const eps        = data.map(d => d.Basic_EPS)
        const netProfit  = data.map(d => d.Net_Profit)
        const shareCount = data.map(d => d.Share_Count_Millions)

        //YoY Growth calculation
        const yoy = [null]
        for (let i = 1; i < eps.length; i++) {
          const growth = ((eps[i] - eps[i - 1]) / eps[i - 1]) * 100
          yoy.push(growth)
        }

        //Events
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
              label: 'Basic EPS (In Mn)',
              data: eps,
              borderColor: 'green',
              backgroundColor: 'rgba(0, 255, 0, 0.2)',
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
                  const yr  = labels[i]
                  const valueEPS       = eps[i]
                  const valueNetProfit = netProfit[i]
                  const valueShares    = shareCount[i]
                  // format numbers with commas and 2 decimals
                  const fmt = v => v.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })
                  const lines = [
                    `EPS: ${fmt(valueEPS)}`,
                    `Net Profit: ${fmt(valueNetProfit)}`,
                    `Shares: ${fmt(valueShares)} M`
                  ]
                  if (yoy[i] != null) {
                    lines.push(`YoY Growth: ${yoy[i].toFixed(1)}%`)
                  }
                  if (eventMap[yr]) {
                    lines.push(eventMap[yr])
                  }
                  return lines
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
                text: 'Basic EPS'
              },
              ticks: {
                callback: value =>
                  value.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })
              }
            }
          },
          onClick: (evt, elements) => {
            if (elements.length > 0) {
              const idx = elements[0].index
              const dataPoint = {
                year:      data[idx].Year,
                eps:       data[idx].Basic_EPS,
                netProfit: data[idx].Net_Profit
              }
              if (onDrillDown) onDrillDown(dataPoint)
            }
          }
        })
      })
      .catch(err => console.error(err))
  }, [year, currency, events, onDrillDown])

  return <Line data={chartData} options={chartOptions} />
}

export default EPSChart
