-- Mengizinkan siapa saja (publik/anonim) mengunggah file ke bucket 'images'
CREATE POLICY "Izinkan unggah publik ke images"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'images' );

-- Mengizinkan siapa saja (publik/anonim) melihat/membaca file dari bucket 'images'
CREATE POLICY "Izinkan lihat publik dari images"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'images' );

-- Mengizinkan siapa saja (publik/anonim) menghapus file dari bucket 'images'
CREATE POLICY "Izinkan hapus publik dari images"
ON storage.objects FOR DELETE
TO public
USING ( bucket_id = 'images' );
