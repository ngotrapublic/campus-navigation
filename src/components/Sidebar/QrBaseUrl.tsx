type QrBaseUrlProps = {
  baseUrl: string
  setBaseUrl: (baseUrl: string) => void
}

export function QrBaseUrl({ baseUrl, setBaseUrl }: QrBaseUrlProps) {
  return (
    <section className="panel">
      <h2>QR base URL</h2>
      <input
        className="text-input"
        value={baseUrl}
        onChange={(event) => setBaseUrl(event.target.value)}
        placeholder="https://nav.example.edu"
      />
      <p className="hint">
        Public host URL for QR codes, e.g. https://your-app.vercel.app — then
        re-select the QR point so the code updates. Leave empty to use the
        current site origin.
      </p>
    </section>
  )
}
