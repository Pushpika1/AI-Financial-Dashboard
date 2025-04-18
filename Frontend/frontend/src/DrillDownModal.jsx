import React from 'react'

const DrillDownModal = ({ data, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">Drill-Down Data</h2>
        <pre className="modal-content">
          {JSON.stringify(data, null, 2)}
        </pre>
        <button onClick={onClose} className="button-close">
          Close
        </button>
      </div>
    </div>
  )
}

export default DrillDownModal
