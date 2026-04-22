COPY (
SELECT h.ten_hd, h.trang_thai
FROM hoat_dong h
WHERE h.hoc_ky='hoc_ky_1'
AND h.nam_hoc = '2025'
AND h.lop_id IN (SELECT id FROM lop WHERE chu_nhiem = (SELECT id FROM nguoi_dung WHERE ten_dn='gv0404'))
ORDER BY h.ngay_tao
) TO STDOUT WITH CSV HEADER;
