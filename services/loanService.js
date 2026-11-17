const BASE_URL = 'https://6afc00f8892984c4494a93ee.mockapi.io/api/v1';
const ITEMS_URL = `${BASE_URL}/items`;
const LOANS_URL = `${BASE_URL}/loans`;

// --- API MASTER BARANG & STOK ---
export const getItems = async () => {
  const response = await fetch(ITEMS_URL, { cache: 'no-store' });
  if (!response.ok) throw new Error('Gagal mengambil data stok barang');
  return response.json();
};

export const createItem = async (payload) => {
  const response = await fetch(ITEMS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Gagal menambahkan barang');
  return response.json();
};

export const updateItem = async (id, payload) => {
  const response = await fetch(`${ITEMS_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Gagal memperbarui stok barang');
  return response.json();
};

// --- API RIWAYAT PEMINJAMAN ---
export const getLoans = async () => {
  const response = await fetch(LOANS_URL, { cache: 'no-store' });
  if (!response.ok) throw new Error('Gagal mengambil riwayat peminjaman');
  const data = await response.json();
  return Array.isArray(data) ? data.reverse() : [];
};

export const createLoan = async (payload) => {
  const response = await fetch(LOANS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Gagal mencatat peminjaman');
  return response.json();
};

export const updateLoan = async (id, payload) => {
  const response = await fetch(`${LOANS_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Gagal memperbarui status peminjaman');
  return response.json();
};

export const deleteLoan = async (id) => {
  const response = await fetch(`${LOANS_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Gagal menghapus riwayat peminjaman');
  return response.json();
};