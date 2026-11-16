import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  BuildSelection,
  CompatibilityReport,
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
import {
  createBuildSession,
  deleteBuildSession,
  getBuildSession,
  removeBuildComponent,
  selectBuildComponent,
  validateBuildSelection,
} from './services/builderApi';
import { fetchAllInventory } from './services/inventoryApi';
import { Navbar, type ActiveView } from './components/Navbar';
import { FeedView } from './components/FeedView';
import { BuilderView } from './components/BuilderView';
import { CreateItemView } from './components/CreateItemView';
import { Footer } from './components/Footer';

const BUILD_SESSION_STORAGE_KEY = 'hardwareset_build_session_id';

export function App() {
  const [activeView, setActiveView] = useState<ActiveView>('feed');
  const [activeCategory, setActiveCategory] = useState<HardwareCategory>('cpu');
  const [products, setProducts] = useState<HardwareProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selection, setSelection] = useState<BuildSelection>({});
  const [buildSessionId, setBuildSessionId] = useState<string | null>(() =>
    localStorage.getItem(BUILD_SESSION_STORAGE_KEY)
  );
  const [compatibility, setCompatibility] =
    useState<CompatibilityReport | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const hasRestoredSessionRef = useRef(false);

  const loadCatalog = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const [catalogItems, inventoryItems] = await Promise.all([
        fetchAllProducts(),
        fetchAllInventory().catch(() => []),
      ]);

      const stockByProductId = new Map(
        inventoryItems.map((inv) => [inv.productId, inv.availableQuantity])
      );

      const merged = catalogItems.map((item) => ({
        ...item,
        availableQuantity: stockByProductId.get(item.id),
      }));

      setProducts(merged);
    } catch {
      setApiError('Não foi possível carregar o catálogo no momento.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  // Restaura a sessão salva se existir um buildSessionId válido
  useEffect(() => {
    if (
      hasRestoredSessionRef.current ||
      !buildSessionId ||
      products.length === 0
    ) {
      return;
    }

    hasRestoredSessionRef.current = true;

    void (async () => {
      try {
        const session = await getBuildSession(buildSessionId);
        const restoredSelection: BuildSelection = {};

        for (const [catKey, comp] of Object.entries(session.components || {})) {
          const category = catKey.toLowerCase() as HardwareCategory;
          const matched = products.find(
            (p) =>
              (comp.productId && p.id === comp.productId) ||
              p.name.toLowerCase() === comp.name.toLowerCase()
          );
          if (matched) {
            restoredSelection[category] = matched;
          }
        }

        if (Object.keys(restoredSelection).length > 0) {
          setSelection(restoredSelection);
          setCompatibility(session.compatibility);
        }
      } catch {
        localStorage.removeItem(BUILD_SESSION_STORAGE_KEY);
        setBuildSessionId(null);
      }
    })();
  }, [buildSessionId, products]);

  // Valida a compatibilidade via Gateway sempre que a seleção de peças mudar
  useEffect(() => {
    const selectedItems = Object.values(selection).filter(
      (item): item is HardwareProduct => Boolean(item)
    );

    if (selectedItems.length === 0) {
      setCompatibility(null);
      return;
    }

    let cancelled = false;
    setIsValidating(true);

    void validateBuildSelection(selection)
      .then((res) => {
        if (!cancelled) {
          setCompatibility(res.compatibility);
        }
      })
      .catch(() => {
        // Mantém a interface funcional caso o serviço de validação esteja indisponível
      })
      .finally(() => {
        if (!cancelled) {
          setIsValidating(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selection]);

  const syncFullSessionInGateway = useCallback(
    async (nextSelection: BuildSelection) => {
      try {
        const session = await createBuildSession(
          'Configuração Personalizada',
          nextSelection
        );
        setBuildSessionId(session.id);
        localStorage.setItem(BUILD_SESSION_STORAGE_KEY, session.id);
        setCompatibility(session.compatibility);
      } catch {
        // Silencioso caso o gateway ainda não esteja ativo
      }
    },
    []
  );

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
    const nextSelection: BuildSelection = { ...setup.parts };
    setSelection(nextSelection);
    setActiveCategory('gpu');
    setActiveView('builder');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    void syncFullSessionInGateway(nextSelection);
  };

  const handleSelectSinglePartAndBuild = (product: HardwareProduct) => {
    const nextSelection: BuildSelection = {
      ...selection,
      [product.category]: product,
    };
    setSelection(nextSelection);

    const nextEmpty =
      SLOT_DEFINITIONS.find(
        (slot) =>
          slot.category !== product.category && !nextSelection[slot.category]
      )?.category || product.category;

    setActiveCategory(nextEmpty);
    setActiveView('builder');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    void syncFullSessionInGateway(nextSelection);
  };

  const handleSelectPart = (product: HardwareProduct) => {
    const nextSelection: BuildSelection = {
      ...selection,
      [product.category]: product,
    };
    setSelection(nextSelection);

    void (async () => {
      try {
        if (!buildSessionId) {
          const created = await createBuildSession(
            'Configuração Personalizada',
            nextSelection
          );
          setBuildSessionId(created.id);
          localStorage.setItem(BUILD_SESSION_STORAGE_KEY, created.id);
          setCompatibility(created.compatibility);
        } else {
          const updated = await selectBuildComponent(
            buildSessionId,
            product.category,
            product
          );
          setCompatibility(updated.compatibility);
        }
      } catch {
        // Fallback: se a sessão expirou, recria uma nova
        void syncFullSessionInGateway(nextSelection);
      }
    })();
  };

  const handleRemovePart = (category: HardwareCategory) => {
    setSelection((prev) => {
      const next = { ...prev };
      delete next[category];
      return next;
    });

    if (buildSessionId) {
      void removeBuildComponent(buildSessionId, category)
        .then((updated) => setCompatibility(updated.compatibility))
        .catch(() => {});
    }
  };

  const handleClearBuild = () => {
    setSelection({});
    setCompatibility(null);
    setActiveCategory('cpu');

    if (buildSessionId) {
      const idToDelete = buildSessionId;
      setBuildSessionId(null);
      localStorage.removeItem(BUILD_SESSION_STORAGE_KEY);
      void deleteBuildSession(idToDelete).catch(() => {});
    }
  };

  const handleCreateProduct = async (
    input: CreateProductInput
  ): Promise<HardwareProduct> => {
    const created = await createProductInDb(input);
    setProducts((prev) => [
      { ...created, availableQuantity: 10 },
      ...prev,
    ]);
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
            compatibility={compatibility}
            isValidatingCompatibility={isValidating}
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
