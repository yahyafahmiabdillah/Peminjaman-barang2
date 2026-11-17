'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getItems,
  createItem,
  updateItem,
  getLoans,
  createLoan,
  updateLoan,
  deleteLoan,
} from '../services/loanService';
import StockCards from '../components/StockCards';
import LoanForm from '../components/LoanForm';
import LoanTable from '../components/LoanTable';

const getRealTimeNow = () => {
  return (
    new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) + ' WIB'
  );
};

export default function PeminjamanBarangPage() {
  const [items, setItems] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [clock, setClock] = useState('');

  const syncAllData = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const [latestItems, latestLoans] = await Promise.all([getItems(), getLoans()]);
      setItems(latestItems);
      setLoans(latestLoans);
    } catch (error) {
      console.error('Gagal sinkronisasi:', error);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncAllData(false);
    const syncInterval = setInterval(() => syncAllData(true), 4000);
    return () => clearInterval(syncInterval);
  }, [syncAllData]);

  useEffect(() => {
    setClock(getRealTimeNow());
    const clockInterval = setInterval(() => setClock(getRealTimeNow()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const handleInitStock = async () => {
    setSyncing(true);
    const defaultItems = [
      { name: 'Laptop', category: 'Elektronik', stock: 50 },
      { name: 'Buku', category: 'Literasi', stock: 50 },
      { name: 'Kamera', category: 'Multimedia', stock: 50 },
      { name: 'Proyektor', category: 'Presentasi', stock: 50 },
    ];
    try {
      for (const item of defaultItems) {
        await createItem(item);
      }
      await syncAllData(true);
    } catch (error) {
      alert(error.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleResetStock = async () => {
    if (!confirm('Reset semua stok barang kembali menjadi 50?')) return;
    setSyncing(true);
    try {
      await Promise.all(items.map((item) => updateItem(item.id, { ...item, stock: 50 })));
      await syncAllData(true);
    } catch (error) {
      alert(error.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleSubmitLoans = async (borrowerName, borrowedList) => {
    setSubmitting(true);
    try {
      const freshItems = await getItems();
      const borrowTime = getRealTimeNow();

      for (const entry of borrowedList) {
        const targetItem = freshItems.find((i) => i.id === entry.itemId);
        if (!targetItem || targetItem.stock < entry.quantity) {
          alert(`Stok ${entry.itemName} baru saja berubah dan tidak mencukupi!`);
          await syncAllData(true);
          return false;
        }

        await createLoan({
          itemId: targetItem.id,
          itemName: targetItem.name,
          borrowerName,
          quantity: entry.quantity,
          borrowTime,
          returnTime: '-',
          status: 'Dipinjam',
        });

        await updateItem(targetItem.id, {
          ...targetItem,
          stock: targetItem.stock - entry.quantity,
        });
      }

      await syncAllData(true);
      return true;
    } catch (error) {
      alert(error.message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async (loan) => {
    try {
      const returnTime = getRealTimeNow();
      const freshItems = await getItems();
      const targetItem = freshItems.find((i) => i.id === loan.itemId);

      await updateLoan(loan.id, {
        ...loan,
        status: 'Dikembalikan',
        returnTime,
      });

      if (targetItem) {
        await updateItem(targetItem.id, {
          ...targetItem,
          stock: Number(targetItem.stock) + Number(loan.quantity),
        });
      }

      await syncAllData(true);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (loan) => {
    if (!confirm('Yakin ingin menghapus riwayat peminjaman ini?')) return;
    try {
      if (loan.status === 'Dipinjam') {
        const freshItems = await getItems();
        const targetItem = freshItems.find((i) => i.id === loan.itemId);
        if (targetItem) {
          await updateItem(targetItem.id, {
            ...targetItem,
            stock: Number(targetItem.stock) + Number(loan.quantity),
          });
        }
      }
      await deleteLoan(loan.id);
      await syncAllData(true);
    } catch (error) {
      alert(error.message);
    }
  };

  const filteredLoans = loans.filter((loan) =>
    filterStatus === 'Semua' ? true : loan.status === filterStatus
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Inventaris & Operasional Kantor
            </span>
            <h1 className="text-3xl font-bold text-white mt-1">
              Sistem Peminjaman Barang
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Pemantauan stok dan histori peminjaman tersinkronisasi otomatis antar perangkat.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl text-right">
            <p className="text-[11px] text-slate-400">Waktu Server Lokal</p>
            <p className="text-sm font-mono font-semibold text-indigo-400">
              {clock || 'Memuat jam...'}
            </p>
          </div>
        </div>

        <StockCards
          items={items}
          onInitStock={handleInitStock}
          onResetStock={handleResetStock}
          syncing={syncing}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LoanForm
            items={items}
            onSubmitLoans={handleSubmitLoans}
            submitting={submitting}
          />
          <LoanTable
            loans={filteredLoans}
            loading={loading}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            onReturn={handleReturn}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </main>
  );
}