'use client';

import { useState, useEffect } from 'react';

export default function LoanForm({ items, onSubmitLoans, submitting }) {
  const [borrowerName, setBorrowerName] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (items.length > 0 && !selectedItemId) {
      setSelectedItemId(items[0].id);
    }
  }, [items, selectedItemId]);

  const selectedItem = items.find((i) => i.id === selectedItemId);

  const handleAddToCart = () => {
    if (!selectedItem) return;
    const qty = Number(quantity);
    if (qty < 1) return alert('Jumlah minimal 1');

    const existingInCart = cart.find((c) => c.itemId === selectedItem.id);
    const totalRequested = (existingInCart ? existingInCart.quantity : 0) + qty;

    if (totalRequested > selectedItem.stock) {
      return alert(`Stok ${selectedItem.name} tidak cukup! Sisa stok: ${selectedItem.stock}`);
    }

    if (existingInCart) {
      setCart(
        cart.map((c) =>
          c.itemId === selectedItem.id ? { ...c, quantity: totalRequested } : c
        )
      );
    } else {
      setCart([
        ...cart,
        {
          itemId: selectedItem.id,
          itemName: selectedItem.name,
          quantity: qty,
        },
      ]);
    }
    setQuantity(1);
  };

  const handleRemoveFromCart = (itemId) => {
    setCart(cart.filter((c) => c.itemId !== itemId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!borrowerName.trim()) return alert('Isi nama peminjam terlebih dahulu');

    let itemsToBorrow = [...cart];
    if (itemsToBorrow.length === 0) {
      if (!selectedItem) return alert('Pilih barang terlebih dahulu');
      const qty = Number(quantity);
      if (qty < 1 || qty > selectedItem.stock) {
        return alert(`Stok ${selectedItem.name} tidak mencukupi (Sisa: ${selectedItem.stock})`);
      }
      itemsToBorrow = [
        {
          itemId: selectedItem.id,
          itemName: selectedItem.name,
          quantity: qty,
        },
      ];
    }

    const success = await onSubmitLoans(borrowerName.trim(), itemsToBorrow);
    if (success) {
      setBorrowerName('');
      setCart([]);
      setQuantity(1);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
      <h2 className="text-base font-semibold text-white mb-1">Form Peminjaman</h2>
      <p className="text-xs text-slate-400 mb-4">
        Bisa meminjam 1 barang atau menambahkan beberapa barang sekaligus.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">Nama Peminjam</label>
          <input
            type="text"
            required
            placeholder="Contoh: Andi (Laptop A)"
            value={borrowerName}
            onChange={(e) => setBorrowerName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="block text-xs text-slate-400 mb-1.5">Pilih Barang</label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} (Stok: {item.stock})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Jumlah</label>
            <input
              type="number"
              min="1"
              max={selectedItem ? selectedItem.stock : 50}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={items.length === 0}
          className="w-full bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-medium py-2 rounded-xl border border-slate-700 transition cursor-pointer"
        >
          + Tambah ke Daftar Pinjam (Multi-Barang)
        </button>

        {cart.length > 0 && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">
              Daftar Barang Dipilih ({cart.length}):
            </p>
            {cart.map((item) => (
              <div
                key={item.itemId}
                className="flex items-center justify-between text-xs bg-slate-900 px-3 py-2 rounded-lg"
              >
                <span className="text-white font-medium">
                  {item.itemName} <span className="text-indigo-400">({item.quantity}x)</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveFromCart(item.itemId)}
                  className="text-rose-400 hover:underline cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || items.length === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition cursor-pointer"
        >
          {submitting
            ? 'Memproses...'
            : cart.length > 0
            ? `Pinjam ${cart.length} Jenis Barang Sekarang`
            : 'Pinjam Barang Sekarang'}
        </button>
      </form>
    </div>
  );
}