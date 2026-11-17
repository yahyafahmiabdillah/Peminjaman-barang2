'use client';

export default function StockCards({ items, onInitStock, onResetStock, syncing }) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-white">Stok Barang Real-Time</h2>
          <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Live Sync
          </span>
        </div>

        <div className="flex gap-2">
          {items.length === 0 ? (
            <button
              onClick={onInitStock}
              disabled={syncing}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              {syncing ? 'Menyiapkan...' : '+ Isi Stok Awal (50 / Barang)'}
            </button>
          ) : (
            <button
              onClick={onResetStock}
              disabled={syncing}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
            >
              Reset Semua Stok ke 50
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
          Stok barang masih kosong. Klik tombol <strong>+ Isi Stok Awal (50 / Barang)</strong> di kanan atas untuk membuat daftar barang.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">{item.category}</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    item.stock > 10
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : item.stock > 0
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {item.stock > 0 ? 'Tersedia' : 'Habis'}
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-base font-bold text-white">{item.name}</h3>
                <p className="text-2xl font-extrabold text-indigo-400 mt-1">
                  {item.stock}{' '}
                  <span className="text-xs font-normal text-slate-500">/ 50 unit</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}