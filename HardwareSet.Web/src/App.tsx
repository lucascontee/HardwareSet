import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  BuildSelection,
  CreateProductInput,
  HardwareCategory,
  HardwareProduct,
  PrebuiltSetup,
} from './types/hardware';
import { SLOT_DEFINITIONS } from './data/hardwareCatalog';
import {
  createProductInDb,
  fetchAllProducts,
} from './services/productApi';
import { Navbar, type ActiveView } from './components/Navbar';
import { FeedView } from './components/FeedView';
import { BuilderView } from './components/BuilderView';
import { CreateItemView } from './components/CreateItemView';
import { Footer } from './components/Footer';

export function App() {
  const [activeView, setActiveView] = useState<ActiveView>('feed');
  const [activeCategory, setActiveCategory] = useState<HardwareCategory>('cpu');
  const [products, setProducts] = useState<HardwareProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selection, setSelection] = useState<BuildSelection>({});

  const loadCatalog = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const items = await fetchAllProducts();
      setProducts(items);
    } catch {
      setApiError('Não foi possível carregar o catálogo no momento.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const totalPrice = useMemo(() => {
    const items = Object.values(selection).filter(
      (item): item is HardwareProduct => Boolean(item)
    );
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [selection]);

  const handleNavigate = (view: ActiveView, sectionId?: string) => {
    setActiveView(view);

    if (view === 'feed' && sectionId) {
      requestAnimationFrame(() => {
        if (sectionId === 'top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStartEmptyBuilder = () => {
    const firstEmpty =
      SLOT_DEFINITIONS.find((slot) => !selection[slot.category])?.category ||
      'cpu';
    setActiveCategory(firstEmpty);
    setActiveView('builder');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadPrebuiltSetup = (setup: PrebuiltSetup) => {
    setSelection({ ...setup.parts });
    setActiveCategory('gpu');
    setActiveView('builder');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSinglePartAndBuild = (product: HardwareProduct) => {
    setSelection((prev) => ({
      ...prev,
      [product.category]: product,
    }));

    const nextEmpty =
      SLOT_DEFINITIONS.find(
        (slot) =>
          slot.category !== product.category && !selection[slot.category]
      )?.category || product.category;

    setActiveCategory(nextEmpty);
    setActiveView('builder');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPart = (product: HardwareProduct) => {
    setSelection((prev) => ({
      ...prev,
      [product.category]: product,
    }));
  };

  const handleRemovePart = (category: HardwareCategory) => {
    setSelection((prev) => {
      const next = { ...prev };
      delete next[category];
      return next;
    });
  };

  const handleClearBuild = () => {
    setSelection({});
    setActiveCategory('cpu');
  };

  const handleCreateProduct = async (
    input: CreateProductInput
  ): Promise<HardwareProduct> => {
    const created = await createProductInDb(input);
    setProducts((prev) => [created, ...prev]);
    return created;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--g-main)] text-[var(--ink)]">
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        totalPrice={totalPrice}
      />

      <main id="top" className="flex-1">
        {activeView === 'feed' && (
          <FeedView
            products={products}
            isLoading={isLoading}
            error={apiError}
            onStartEmptyBuilder={handleStartEmptyBuilder}
            onOpenCreateItem={() => handleNavigate('create')}
            onLoadPrebuiltSetup={handleLoadPrebuiltSetup}
            onSelectSinglePartAndBuild={handleSelectSinglePartAndBuild}
          />
        )}

        {activeView === 'builder' && (
          <BuilderView
            products={products}
            selection={selection}
            activeCategory={activeCategory}
            onChangeCategory={setActiveCategory}
            onSelectPart={handleSelectPart}
            onRemovePart={handleRemovePart}
            onClearBuild={handleClearBuild}
            onLoadPrebuilt={handleLoadPrebuiltSetup}
            onOpenCreateItem={() => handleNavigate('create')}
            onBackToFeed={() => handleNavigate('feed', 'top')}
          />
        )}

        {activeView === 'create' && (
          <CreateItemView
            onCreateProduct={handleCreateProduct}
            onBackToFeed={() => handleNavigate('feed', 'top')}
          />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
