import { useMemo, useState } from 'react';
import type {
  BuildSelection,
  HardwareCategory,
  HardwareProduct,
  PrebuiltSetup,
} from './types/hardware';
import { SLOT_DEFINITIONS, getProductById } from './data/hardwareCatalog';
import { Navbar, type ActiveView } from './components/Navbar';
import { FeedView } from './components/FeedView';
import { BuilderView } from './components/BuilderView';
import { Footer } from './components/Footer';

export function App() {
  const [activeView, setActiveView] = useState<ActiveView>('feed');
  const [activeCategory, setActiveCategory] = useState<HardwareCategory>('cpu');
  const [selection, setSelection] = useState<BuildSelection>({});

  const { selectedCount, totalPrice } = useMemo(() => {
    const items = Object.values(selection).filter(
      (item): item is HardwareProduct => Boolean(item)
    );
    const total = items.reduce((sum, item) => sum + item.price, 0);
    return {
      selectedCount: items.length,
      totalPrice: total,
    };
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
    const hydrated: BuildSelection = {};
    (Object.keys(setup.parts) as HardwareCategory[]).forEach((category) => {
      const product = getProductById(setup.parts[category]);
      if (product) {
        hydrated[category] = product;
      }
    });
    setSelection(hydrated);
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

  return (
    <div className="min-h-screen flex flex-col bg-[var(--g-main)] text-[var(--ink)]">
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        selectedCount={selectedCount}
        totalSpots={SLOT_DEFINITIONS.length}
        totalPrice={totalPrice}
      />

      <main id="top" className="flex-1">
        {activeView === 'feed' ? (
          <FeedView
            onStartEmptyBuilder={handleStartEmptyBuilder}
            onLoadPrebuiltSetup={handleLoadPrebuiltSetup}
            onSelectSinglePartAndBuild={handleSelectSinglePartAndBuild}
          />
        ) : (
          <BuilderView
            selection={selection}
            activeCategory={activeCategory}
            onChangeCategory={setActiveCategory}
            onSelectPart={handleSelectPart}
            onRemovePart={handleRemovePart}
            onClearBuild={handleClearBuild}
            onLoadPrebuilt={handleLoadPrebuiltSetup}
            onBackToFeed={() => handleNavigate('feed', 'top')}
          />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
