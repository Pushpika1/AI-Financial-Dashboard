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

const RevenueChart = ({ year, currency, events, onDrillDown }) => {
  const [chartData, setChartData]     = useState({ labels: [], datasets: [] })
  const [chartOptions, setChartOptions] = useState({})

  useEffect(() => {
    let url = 'http://localhost:5000/api/financials?'
    if (year)     url += `year=${year}&`
    if (currency) url += `currency=${currency}&`

    fetch(url)
      .then(res => res.json())
      .then(data => {
        //extract labels and revenue values
        const labels  = data.map(d => `${d.Year}`)
        const revenue = data.map(d => d['Total revenue'])

        //calculate YoY growth (for tooltips)
        const yoy = [null]
        for (let i = 1; i < revenue.length; i++) {
          const growth = ((revenue[i] - revenue[i - 1]) / revenue[i - 1]) * 100
          yoy.push(growth)
        }

        //prepare chart data
        setChartData({
          labels,
          datasets: [
            {
              label: "Total Revenue (In '000s)",
              data: revenue,
              borderColor: 'blue',
              backgroundColor: 'rgba(0, 0, 255, 0.2)',
              tension: 0.3,
              fill: true
            }
          ]
        })

        //prepare chart options, including formatting
        setChartOptions({
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: ctx => {
                  const i     = ctx.dataIndex
                  const raw   = revenue[i]
                  const growth= yoy[i]
                  const yr    = ctx.label
                  const evt   = events.find(e => `${e.year}` === yr)?.description

                  //format number with commas & 2 decimals
                  const formatted = raw.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })

                  let line = `Revenue: ${formatted}`
                  if (growth != null) {
                    line += ` | YoY Growth: ${growth.toFixed(1)}%`
                  }
                  if (evt) {
                    line += ` | ${evt}`
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
              },
              ticks: {
                autoSkip: false,
                maxRotation: 0,
                minRotation: 0
              }
            },
            y: {
              title: {
                display: true,
                text: "Revenue"
              },
              ticks: {
                //format each tick with commas & 2 decimals
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
              const dp = {
                year:    data[idx].Year,
                revenue: data[idx]['Total revenue']
              }
              if (onDrillDown) onDrillDown(dp)
            }
          }
        })
      })
      .catch(err => console.error(err))
  }, [year, currency, events, onDrillDown])

  return <Line data={chartData} options={chartOptions} />
}

export default RevenueChart
