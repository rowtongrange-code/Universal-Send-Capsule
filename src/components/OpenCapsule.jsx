import { useState, useEffect } from 'react'
import sodium from 'libsodium-wrappers'

export default function OpenCapsule() {
  const [status, setStatus] = useState('')
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const url = params.get('url')
    const keyHex = window.location.hash.slice(1)

    if (url && keyHex) {
      openCapsule(url, keyHex)
    }
  }, [])

  async function openCapsule(url, keyHex) {
    try {
      setStatus('Opening your capsule...')
      await sodium.ready

      const key = sodium.from_hex(keyHex)

      const response = await fetch(url)
      if (!response.ok) throw new Error('Could not fetch capsule')

      const buffer = await response.arrayBuffer()
      const combined = new Uint8Array(buffer)

      const nonce = combined.slice(0, sodium.crypto_secretbox_NONCEBYTES)
      const encrypted = combined.slice(sodium.crypto_secretbox_NONCEBYTES)

      const decrypted = sodium.crypto_secretbox_open_easy(encrypted, nonce, key)
      const payload = JSON.parse(new TextDecoder().decode(decrypted))

      setFiles(payload)
      setStatus('Capsule opened successfully!')
    } catch (e) {
      setError('Could not open capsule. The link may be invalid or corrupted.')
      setStatus('')
    }
  }

  function downloadFile(file) {
    const bytes = new Uint8Array(file.data)
    const blob = new Blob([bytes], { type: file.type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="card">
      <h2>Open a Capsule</h2>

      {!window.location.search && (
        <p>Paste a capsule link in your browser address bar to open it.</p>
      )}

      {status && <p>{status}</p>}
      {error && <p className="error">{error}</p>}

      {files.length > 0 && (
        <div>
          <p>Your capsule contains {files.length} file(s):</p>
          {files.map((file, i) => (
            <div key={i} className="file-item">
              <span>{file.name}</span>
              <button onClick={() => downloadFile(file)}>Download</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}