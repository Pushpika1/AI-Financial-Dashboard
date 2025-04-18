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

const CostVsOpExChart = ({ year, currency, events, onDrillDown }) => {
  const [chartData, setChartData]     = useState({ labels: [], datasets: [] })
  const [chartOptions, setChartOptions] = useState({})

  useEffect(() => {
    let url = 'http://localhost:5000/api/financials?'
    if (year)     url += `year=${year}&`
    if (currency) url += `currency=${currency}&`

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const labels       = data.map(d => `${d.Year}`)
        const costSales    = data.map(d => d['Cost of sales'])
        const opEx         = data.map(d => d['Total operating expenses'])

        //compute YoY growth 
        const costSalesYoY = [null]
        const opExYoY      = [null]
        for (let i = 1; i < data.length; i++) {
          costSalesYoY.push(((costSales[i] - costSales[i - 1]) / costSales[i - 1]) * 100)
          opExYoY.push(((opEx[i]      - opEx[i - 1])      / opEx[i - 1])      * 100)
        }

        //events by year
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
              label: "Cost of Sales (In Rs.'000s)",
              data: costSales,
              backgroundColor: 'rgba(255, 99, 132, 0.5)'
            },
            {
              label: "Operating Expenses (In '000s)",
              data: opEx,
              backgroundColor: 'rgba(54, 162, 235, 0.5)'
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
                  const datasetLabel = ctx.dataset.label
                  const i            = ctx.dataIndex
                  const rawValue     = ctx.raw
                  const yoy          = datasetLabel.startsWith('Cost')
                    ? costSalesYoY[i]
                    : opExYoY[i]

                  // format number with commas & two decimals
                  const formatted = rawValue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })

                  let line = `${datasetLabel}: ${formatted}`
                  if (yoy != null) {
                    line += ` | YoY Growth: ${yoy.toFixed(1)}%`
                  }
                  const yr = labels[i]
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
                text: "Amount"
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
              const dataPoint = { year: data[idx].Year }
              onDrillDown?.(dataPoint)
            }
          }
        })
      })
      .catch(err => console.error(err))
  }, [year, currency, events, onDrillDown])

  return <Bar data={chartData} options={chartOptions} />
}

export default CostVsOpExChart
