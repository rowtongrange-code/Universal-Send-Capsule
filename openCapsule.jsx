import React, { useState } from 'react';
export default function OpenCapsule() {
  const [capsuleId, setCapsuleId] = useState('');
  const [key, setKey] = useState('');
  const [data, setData] = useState('');
  const openCapsule = async () => {
    const res = await fetch('/open', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({capsule_id: capsuleId, key})
    });
    const json = await res.json();
    setData(json.data);
  };
  return (
    <div>
      <h2>Open Capsule</h2>
      <input placeholder='Capsule ID' value={capsuleId} onChange={e => setCapsuleId(e.target.value)} />
      <input placeholder='Key' value={key} onChange={e => setKey(e.target.value)} />
      <button onClick={openCapsule}>Open</button>
      <pre>{data}</pre>
    </div>
  );
}
