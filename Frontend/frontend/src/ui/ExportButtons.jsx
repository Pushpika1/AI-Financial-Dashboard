import React from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const ExportButtons = () => {
  //PDF Export — Multi-page support
  const handleExportPDF = () => {
    const dashboard = document.getElementById('dashboard-container')
    if (!dashboard) {
      alert("Dashboard container not found.")
      return
    }

    html2canvas(dashboard, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * pdfWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0

      //first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight

      //more pages if needed
      while (heightLeft > 0) {
        position -= pdfHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight
      }

      pdf.save('dashboard_snapshot.pdf')
    })
  }

  //CSV Export — Merge financial + shareholder data
  const handleExportCSV = async () => {
    try {
      const [financialRes, shareholderRes] = await Promise.all([
        fetch('http://localhost:5000/api/financials'),
        fetch('http://localhost:5000/api/shareholders')
      ])

      const financialData = await financialRes.json()
      const shareholderData = await shareholderRes.json()

      //financial data block
      const financialKeys = Object.keys(financialData[0] || {})
      const financialRows = [financialKeys]
      financialData.forEach(row => {
        financialRows.push(financialKeys.map(k => row[k]))
      })

      //shareholder data block
      const shareholderYears = Object.keys(shareholderData[0] || {}).filter(k => k !== "Shareholder")
      const shareholderHeader = ["Shareholder", ...shareholderYears]
      const shareholderRows = [shareholderHeader]
      shareholderData.forEach(row => {
        shareholderRows.push(shareholderHeader.map(k => row[k]))
      })

      //combine both
      const spacer = [""]
      const allRows = [
        ["Financial Metrics"],
        ...financialRows,
        spacer,
        ["Top 20 Shareholders"],
        ...shareholderRows
      ]

      const csvContent = 'data:text/csv;charset=utf-8,' +
        allRows.map(r => r.join(',')).join('\n')

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', 'dashboard_complete_data.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("CSV Export Failed:", err)
      alert("Failed to export dashboard CSV.")
    }
  }

  return (
    <div className="export-buttons">
      <button className="button" onClick={handleExportPDF}>
        Export PDF
      </button>
      <button className="button" onClick={handleExportCSV}>
        Export CSV
      </button>
    </div>
  )
}

export default ExportButtons
