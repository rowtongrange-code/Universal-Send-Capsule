import { useState } from 'react'
import sodium from 'libsodium-wrappers'
import { put } from '@vercel/blob'

export default function CreateCapsule() {
  const [files, setFiles] = useState([])
  const [capsuleLink, setCapsuleLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')

  async function createCapsule() {
    if (files.length === 0) return alert('Please select at least one file')

    setLoading(true)
    setProgress('Preparing your files...')

    await sodium.ready

    const key = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES)
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES)

    setProgress('Encrypting your capsule...')

    const fileData = []
    for (const file of files) {
      const bytes = new Uint8Array(await file.arrayBuffer())
      fileData.push({
        name: file.name,
        type: file.type,
        data: Array.from(bytes)
      })
    }

    const payload = new TextEncoder().encode(JSON.stringify(fileData))
    const encrypted = sodium.crypto_secretbox_easy(payload, nonce, key)

    const combined = new Uint8Array(nonce.length + encrypted.length)
    combined.set(nonce)
    combined.set(encrypted, nonce.length)

    setProgress('Uploading your capsule...')

    try {
      const blob = await put(`capsule-${Date.now()}.enc`, combined, {
        access: 'public',
        token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN,
      })

      const keyHex = sodium.to_hex(key)
      const link = `${window.location.origin}/open?url=${encodeURIComponent(blob.url)}#${keyHex}`

      setProgress('')
      setCapsuleLink(link)
    } catch (err) {
      alert('Upload failed: ' + err.message)
      setProgress('')
    }

    setLoading(false)
  }

  return (
    <div className="card">
      <h2>Create a Capsule</h2>
      <p>Select one or more files to seal into your capsule.</p>

      <input
        type="file"
        multiple
        onChange={e => setFiles(Array.from(e.target.files))}
      />

      {files.length > 0 && (
        <p>{files.length} file(s) selected — {(Array.from(files).reduce((a, f) => a + f.size, 0) / 1024 / 1024).toFixed(2)}mb</p>
      )}

      <button onClick={createCapsule} disabled={loading}>
        {loading ? 'Creating...' : 'Create Capsule'}
      </button>

      {progress && <p style={{ color: '#2b6cb0', marginTop: 12 }}>{progress}</p>}

      {capsuleLink && (
        <div className="result">
          <p>✅ Your capsule is ready. Copy the link and share it with anyone.</p>
          <textarea readOnly value={capsuleLink} rows={4} />
          <button onClick={() => {
            navigator.clipboard.writeText(capsuleLink)
            alert('Link copied!')
          }}>
            Copy Link
          </button>
        </div>
      )}
    </div>
  )
}