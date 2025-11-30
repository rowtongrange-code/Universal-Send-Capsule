import React, { useState } from 'react';
import { generateQRCode } from '../utils/qrcode';
export default function CapsuleForm() {
  const [file, setFile] = useState(null);
  const [capsuleLink, setCapsuleLink] = useState('');
  const createCapsule = async () => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/create', {
      method: 'POST',
      body: formData
    });
    const json = await res.json();
    setCapsuleLink(json.capsule_id);
    generateQRCode(json.capsule_id);
  };
  return (
    <div>
      <input type='file' onChange={e => setFile(e.target.files[0])} />
      <button onClick={createCapsule}>Create Capsule</button>
      {capsuleLink && <p>Link: {capsuleLink}</p>}
      <div id='qrcode'></div>
    </div>
  );
}
