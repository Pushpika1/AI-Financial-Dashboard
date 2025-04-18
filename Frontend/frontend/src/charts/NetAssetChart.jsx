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

const NetAssetChart = ({ year, currency, events, onDrillDown }) => {
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
        const nas    = data.map(d => d.Net_Assets_Per_Share)

        //compute YoY growth
        const yoy = [null]
        for (let i = 1; i < nas.length; i++) {
          yoy.push(((nas[i] - nas[i - 1]) / nas[i - 1]) * 100)
        }

        //map events by year
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
              label: 'Net Asset Per Share (In Mn)',
              data: nas,
              borderColor: 'red',
              backgroundColor: 'rgba(255, 0, 0, 0.2)',
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
                  const val = nas[i]
                  const yr  = labels[i]
                  // format with commas + two decimals
                  const formatted = val.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })
                  let line = yoy[i] != null
                    ? `Net Asset/Share: ${formatted} | YoY: ${yoy[i].toFixed(1)}%`
                    : `Net Asset/Share: ${formatted}`

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
                text: 'Net Asset Per Share'
              },
              ticks: {
                // apply comma + two decimal formatting to each
                callback: value =>
                  value.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })
              }
            }
          },
          onClick: (evt, elements) => {
            if (!elements.length) return
            const idx = elements[0].index
            const dataPoint = {
              year:     data[idx].Year,
              netAsset: data[idx].Net_Assets_Per_Share
            }
            onDrillDown?.(dataPoint)
          }
        })
      })
      .catch(err => console.error(err))
  }, [year, currency, events, onDrillDown])

  return <Line data={chartData} options={chartOptions} />
}

export default NetAssetChart
