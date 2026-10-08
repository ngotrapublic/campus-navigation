type DataPanelProps = {
  downloadExport: () => void
  uploadImport: (file: File) => void
}

export function DataPanel({ downloadExport, uploadImport }: DataPanelProps) {
  return (
    <section className="panel">
      <h2>Data</h2>
      <div className="stack">
        <button type="button" onClick={downloadExport}>
          Export JSON
        </button>
        <label className="file-button">
          Import JSON
          <input
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) {
                uploadImport(file)
              }
              event.target.value = ''
            }}
          />
        </label>
      </div>
    </section>
  )
}
