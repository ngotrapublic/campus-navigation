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
        For phone test on Wi‑Fi: set this to your laptop LAN URL, e.g.
        http://192.168.x.x:5173 — then re-select the QR point so the code
        updates.
      </p>
    </section>
  )
}
