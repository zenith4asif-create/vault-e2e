import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { User, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, fetchVaultBlob, saveVaultBlob, formatFriendlyAuthError } from './services/firebase';
import { deriveKey, encryptVault, decryptVault, randomBytes, toBase64, fromBase64, SALT_BYTES } from './services/crypto';
import { speak, playLiquidClick } from './services/audio';
import { VaultItem, VaultBlob, VaultCategory, ViewState } from './types/vault';

// Components
import { LiquidBackground } from './components/LiquidBackground';
import { LiquidNavbar } from './components/LiquidNavbar';
import { LiquidStats } from './components/LiquidStats';
import { LiquidToolbar } from './components/LiquidToolbar';
import { LiquidCard } from './components/LiquidCard';
import { LiquidLoginView, LiquidUnlockView } from './components/LiquidAuthViews';
import { ScifiLiquidDecryptPortal } from './components/ScifiLiquidDecryptPortal';
import { ItemModal } from './components/ItemModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { PasswordGeneratorModal } from './components/PasswordGeneratorModal';
import { SecurityAuditModal } from './components/SecurityAuditModal';
import { ExportImportModal } from './components/ExportImportModal';
import { MediaViewerModal } from './components/MediaViewerModal';
import { LiquidToast } from './components/LiquidToast';
import { Plus, ShieldAlert, Sparkles, KeyRound } from 'lucide-react';

export default function App() {
  // Authentication & Cryptographic State
  const [view, setView] = useState<ViewState>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [vaultBlob, setVaultBlob] = useState<VaultBlob | null>(null);
  const [items, setItems] = useState<VaultItem[]>([]);

  // UI State
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | VaultCategory>('all');
  const [activeNavTab, setActiveNavTab] = useState<'vault' | 'generator' | 'audit' | 'export'>('vault');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Portal Animation State
  const [activePortal, setActivePortal] = useState<'login' | 'unlock' | null>(null);

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<VaultItem | null>(null);
  const [previewItem, setPreviewItem] = useState<VaultItem | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warn' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false
  });

  const showToast = useCallback((message: string, type: 'success' | 'warn' | 'error' | 'info' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 2800);
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setAuthError('');
        try {
          const blob = await fetchVaultBlob(user.uid);
          setVaultBlob(blob);
        } catch (err) {
          console.warn('Error fetching vault blob:', err);
        }
        setView('unlock');
      } else {
        setCurrentUser(null);
        setCryptoKey(null);
        setItems([]);
        setVaultBlob(null);
        setView('login');
      }
    });

    return () => unsubscribe();
  }, []);

  // Initial welcome speech
  useEffect(() => {
    const timer = setTimeout(() => {
      if (view === 'login') {
        speak('Welcome at personal vault. Enter your email and password');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [view]);

  // Handle Login
  const handleLogin = async (email: string, pass: string) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      if (auth) {
        const credential = await signInWithEmailAndPassword(auth, email, pass);
        setCurrentUser(credential.user);
        speak('Auto entering the vault');
        setActivePortal('login');
      } else {
        throw new Error('Firebase Auth not available');
      }
    } catch (err) {
      const msg = formatFriendlyAuthError(err);
      setAuthError(msg);
      showToast(msg, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Master Password Unlock
  const handleUnlock = async (masterPassword: string, confirmPassword?: string) => {
    setAuthLoading(true);
    setAuthError('');

    if (masterPassword.length < 8) {
      setAuthError('Master password must contain at least 8 characters.');
      setAuthLoading(false);
      return;
    }

    const isCreate = !vaultBlob;

    if (isCreate && masterPassword !== confirmPassword) {
      setAuthError('Confirmation password does not match.');
      setAuthLoading(false);
      return;
    }

    try {
      let saltBytes: Uint8Array;
      if (isCreate) {
        saltBytes = randomBytes(SALT_BYTES);
      } else {
        saltBytes = new Uint8Array(fromBase64(vaultBlob.salt));
      }

      // Key Derivation with PBKDF2 (600,000 iterations)
      const key = await deriveKey(masterPassword, saltBytes);

      if (isCreate) {
        const emptyVault = { items: [] };
        const blob = await encryptVault(emptyVault, key, toBase64(saltBytes.buffer as ArrayBuffer));
        if (currentUser) {
          await saveVaultBlob(currentUser.uid, blob);
        }
        setVaultBlob(blob);
        setCryptoKey(key);
        setItems([]);
        speak('Master banaye');
        setActivePortal('unlock');
      } else {
        // Decrypt stored payload
        const decrypted = await decryptVault(vaultBlob, key);
        setCryptoKey(key);
        setItems(Array.isArray(decrypted.items) ? decrypted.items : []);
        speak('Encrypted data opening');
        setActivePortal('unlock');
      }
    } catch (err) {
      console.error('Decryption failed:', err);
      setAuthError('Incorrect master password or integrity check failed.');
      showToast('Incorrect master password', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  // Complete Portal Animation
  const handlePortalComplete = () => {
    const prevMode = activePortal;
    setActivePortal(null);
    if (prevMode === 'login') {
      setView('unlock');
    } else if (prevMode === 'unlock') {
      setView('dashboard');
      showToast('Vault unlocked and integrity verified', 'success');
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#ffffff', '#cbd5e1', '#94a3b8']
        });
      } catch {
        // Ignore confetti errors
      }
    }
  };

  // Persist Vault changes
  const persistVault = async (updatedItems: VaultItem[]) => {
    if (!cryptoKey || !vaultBlob) return;
    try {
      const blob = await encryptVault({ items: updatedItems }, cryptoKey, vaultBlob.salt);
      if (currentUser) {
        await saveVaultBlob(currentUser.uid, blob);
      }
      setVaultBlob(blob);
      setItems(updatedItems);
    } catch (err) {
      console.error('Persist failed:', err);
      showToast('Failed to encrypt and store vault', 'error');
    }
  };

  // Add or Edit Item
  const handleSaveItem = async (data: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    let updated: VaultItem[];

    if (editingItem) {
      updated = items.map(i =>
        i.id === editingItem.id
          ? { ...i, ...data, updatedAt: now }
          : i
      );
      showToast(`Updated ${data.service || data.fileName || 'entry'}`, 'success');
    } else {
      const newItem: VaultItem = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: now,
        updatedAt: now
      };
      updated = [newItem, ...items];
      showToast(`Encrypted & stored ${data.service || data.fileName || 'entry'}`, 'success');
    }

    setIsItemModalOpen(false);
    setEditingItem(null);
    await persistVault(updated);
  };

  // Delete Item
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    const updated = items.filter(i => i.id !== itemToDelete.id);
    const serviceName = itemToDelete.service || itemToDelete.fileName || 'Item';
    setItemToDelete(null);
    await persistVault(updated);
    showToast(`Deleted ${serviceName}`, 'info');
  };

  // Lock Vault
  const handleLock = () => {
    setCryptoKey(null);
    setItems([]);
    setSearch('');
    setFilter('all');
    setView('unlock');
    showToast('Vault locked. In-memory keys cleared.', 'info');
  };

  // Sign Out
  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
    }
    setCurrentUser(null);
    setCryptoKey(null);
    setItems([]);
    setView('login');
    showToast('Signed out successfully', 'info');
  };

  // Import Backup
  const handleImportItems = async (imported: VaultItem[]) => {
    const existingIds = new Set(items.map(i => i.id));
    const now = Date.now();
    const formatted: VaultItem[] = imported.map(item => ({
      ...item,
      id: existingIds.has(item.id) ? crypto.randomUUID() : item.id,
      updatedAt: now,
      createdAt: item.createdAt || now
    }));
    const merged = [...formatted, ...items];
    await persistVault(merged);
  };

  // Category counts memo
  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = {
      all: items.length
    };
    items.forEach(i => {
      const cat = i.category || 'credential';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [items]);

  // Filter & Search Items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Category filter
      if (filter !== 'all' && (item.category || 'credential') !== filter) {
        return false;
      }
      // Search query
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (item.service || '').toLowerCase().includes(q) ||
        (item.fileName || '').toLowerCase().includes(q) ||
        (item.url || '').toLowerCase().includes(q) ||
        (item.phoneNumber || '').toLowerCase().includes(q) ||
        (item.email || '').toLowerCase().includes(q) ||
        (item.username || '').toLowerCase().includes(q) ||
        (item.password || '').toLowerCase().includes(q) ||
        (item.backupCodes || '').toLowerCase().includes(q) ||
        (item.notes || '').toLowerCase().includes(q)
      );
    });
  }, [items, filter, search]);

  return (
    <div className="relative min-h-screen text-neutral-100 flex flex-col font-sans">
      {/* Interactive Colorless Liquid Canvas */}
      <LiquidBackground />

      {/* Sci-Fi Liquid Decrypt Portal Overlay */}
      {activePortal && (
        <ScifiLiquidDecryptPortal
          mode={activePortal}
          onComplete={handlePortalComplete}
        />
      )}

      {/* Main Viewport Router */}
      {view === 'login' && (
        <LiquidLoginView
          onLogin={handleLogin}
          isLoading={authLoading}
          error={authError}
        />
      )}

      {view === 'unlock' && (
        <LiquidUnlockView
          userEmail={currentUser?.email || 'Signed in'}
          isCreateMode={!vaultBlob}
          onUnlock={handleUnlock}
          onSignOut={handleSignOut}
          isLoading={authLoading}
          error={authError}
        />
      )}

      {view === 'dashboard' && (
        <div className="flex-1 flex flex-col">
          {/* Strict 3-zone Top Bar Contract */}
          <LiquidNavbar
            userEmail={currentUser?.email || 'Encrypted Session'}
            onLock={handleLock}
            onLogout={handleSignOut}
            onOpenGenerator={() => setIsGeneratorOpen(true)}
            onOpenAudit={() => setIsAuditOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
            activeNavTab={activeNavTab}
            setActiveNavTab={setActiveNavTab}
            onToast={showToast}
          />

          {/* Main Dashboard Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-7 lg:py-8">
            {/* Top Stats Strip */}
            <LiquidStats items={items} lastUpdated={vaultBlob?.updatedAt} />

            {/* Toolbar: Search, Category Tabs & Add Button */}
            <LiquidToolbar
              search={search}
              onSearchChange={setSearch}
              activeFilter={filter}
              onFilterChange={setFilter}
              onAddItem={() => {
                setEditingItem(null);
                setIsItemModalOpen(true);
              }}
              onQuickGenerate={() => setIsGeneratorOpen(true)}
              countsByCategory={countsByCategory}
            />

            {/* Items Grid View */}
            {items.length === 0 ? (
              /* Clean Empty State */
              <div className="text-center py-20 px-6 rounded-3xl liquid-glass border border-white/10 max-w-xl mx-auto my-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-400">
                  <Sparkles className="w-8 h-8 text-white/80" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">Your Vault is Empty</h3>
                <p className="text-xs text-neutral-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                  Store your first encrypted credential, Cloudinary image, video, audio, document, secure bookmark, or contact.
                </p>
                <div className="flex items-center justify-center gap-3 mt-6">
                  <button
                    onClick={() => {
                      playLiquidClick();
                      setEditingItem(null);
                      setIsItemModalOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold liquid-btn-primary flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Store First Entry</span>
                  </button>
                  <button
                    onClick={() => {
                      playLiquidClick();
                      setIsGeneratorOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-medium liquid-btn-ghost flex items-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-neutral-400" />
                    <span>Generate Key</span>
                  </button>
                </div>
              </div>
            ) : filteredItems.length === 0 ? (
              /* No Search Results */
              <div className="text-center py-16 px-6 rounded-2xl liquid-glass border border-white/10 max-w-md mx-auto my-6">
                <ShieldAlert className="w-10 h-10 text-neutral-500 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-white">No Matching Entries</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  No records match "{search}" in the selected category.
                </p>
                <button
                  onClick={() => {
                    setSearch('');
                    setFilter('all');
                  }}
                  className="mt-4 px-4 py-1.5 text-xs rounded-xl liquid-btn-ghost cursor-pointer"
                >
                  Clear Search & Filter
                </button>
              </div>
            ) : (
              /* Grid of Colorless Liquid Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredItems.map(item => (
                  <LiquidCard
                    key={item.id}
                    item={item}
                    onEdit={(itemToEdit) => {
                      setEditingItem(itemToEdit);
                      setIsItemModalOpen(true);
                    }}
                    onDelete={(itemToDeleteTarget) => {
                      setItemToDelete(itemToDeleteTarget);
                    }}
                    onPreview={(itemToPreview) => {
                      setPreviewItem(itemToPreview);
                    }}
                    onToast={showToast}
                  />
                ))}
              </div>
            )}
          </main>

          {/* Minimalist Footnote */}
          <footer className="border-t border-white/[0.06] py-5 px-6 text-center text-xs text-neutral-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="font-mono text-[11px]">
                PBKDF2-HMAC-SHA256 (600,000 Rounds) · AES-256-GCM · Cloudinary & Firebase RTDB
              </span>
              <span>
                Developer: <strong className="text-neutral-400 font-medium">Asif Ansari</strong>
              </span>
            </div>
          </footer>
        </div>
      )}

      {/* Modals */}
      <ItemModal
        isOpen={isItemModalOpen}
        item={editingItem}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
      />

      <MediaViewerModal
        isOpen={Boolean(previewItem)}
        item={previewItem}
        onClose={() => setPreviewItem(null)}
        onToast={showToast}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(itemToDelete)}
        item={itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteItem}
      />

      <PasswordGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onToast={showToast}
      />

      <SecurityAuditModal
        isOpen={isAuditOpen}
        items={items}
        onClose={() => setIsAuditOpen(false)}
        onEditItem={(item) => {
          setEditingItem(item);
          setIsItemModalOpen(true);
        }}
      />

      <ExportImportModal
        isOpen={isExportOpen}
        items={items}
        vaultBlob={vaultBlob}
        onClose={() => setIsExportOpen(false)}
        onImportItems={handleImportItems}
        onToast={showToast}
      />

      {/* Toast Notification */}
      <LiquidToast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
      />
    </div>
  );
}
