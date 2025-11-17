import React from 'react';

export default function QRCamera({ videoRef, canvasRef, style }) {
  const h = React.createElement;
  return h(
    'div',
    { style: { position: 'relative', width: '100%', ...style } },
    h('video', { ref: videoRef, style: { width: '100%', borderRadius: 8, backgroundColor: '#000' }, muted: true, playsInline: true }),
    h('canvas', { ref: canvasRef, style: { display: 'none' } })
  );
}
