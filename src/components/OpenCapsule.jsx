import { useState, useEffect } from 'react'
import sodium from 'libsodium-wrappers'

export default function OpenCapsule() {
  const [status, setStatus] = useState('')
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) openFromHash(hash)
  }, [])

  async function openFromHash(hash) {
    try {
      setStatus('Opening your capsule...')
      await sodium.ready

      const [keyHex, b64] = hash.split(':')
      if (!keyHex || !b64) throw new Error('Invalid capsule link')

      const key = sodium.from_hex(keyHex)
      const combined = Uint8Array.from(atob(b64), c => c.charCodeAt(0))

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

      {!window.location.hash && (
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
}``