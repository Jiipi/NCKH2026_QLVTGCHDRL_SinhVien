import React from 'react';
import http from '../../../shared/api/http';

export default function useStudentActivityDetail(id) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState('');

  React.useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    http
      .get('/activities/' + id)
      .then((res) => {
        if (!mounted) return;
        setData(res.data?.data || null);
      })
      .catch(() => {
        if (!mounted) return;
        setErr('Không tải được hoạt động');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [id]);

  return { data, loading, err };
}
