import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Info, PackageSearch, Search, Star } from 'lucide-react'
import { ScreenHeader } from '../../components/layout/Headers'
import { ChipRail } from '../../components/ui/Tabs'
import { EmptyState, cx } from '../../components/ui/primitives'
import { Badge, SimulatedTag } from '../../components/ui/Badge'
import { ProductThumb } from '../../components/product/ProductThumb'
import { useApp } from '../../store/AppContext'
import { useLang } from '../../lib/i18n'
import { CATEGORIES } from '../../data/types'
import { lkr, pct } from '../../lib/format'

type Filter = 'All' | (typeof CATEGORIES)[number]

/**
 * The "Rent" tab — the storefront of the reference platform, where users
 * "rent" merchandise to boost it for a commission. Renting here holds
 * simulated capital only; tapping a card opens product details and never
 * starts an order on its own.
 */
export default function Rent() {
  const { state } = useApp()
  const { t } = useLang()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Filter>('All')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return state.products.filter((p) => {
      const matchesCategory = category === 'All' || p.category === category
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [state.products, query, category])

  return (
    <div className="pb-24">
      <ScreenHeader
        title={
          <span className="flex items-center justify-center gap-1.5">
            {t('rent.title')}
            <span className="text-[10px] font-semibold tracking-wide text-faint uppercase">Rent</span>
          </span>
        }
        subtitle={undefined}
      />

      <div className="sticky top-[52px] z-20 border-b border-hairline bg-white px-4 pt-3 pb-3">
        <div className="relative">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('rent.search')}
            aria-label={t('rent.search')}
            className="tm-field !bg-canvas pl-9"
          />
        </div>
        <ChipRail
          className="mt-3"
          value={category}
          onChange={setCategory}
          items={[
            { key: 'All' as Filter, label: t('cat.All') },
            ...CATEGORIES.map((c) => ({ key: c as Filter, label: t(`cat.${c}`) })),
          ]}
        />
      </div>

      {/* How renting works — the safety explainer, styled like a promo strip */}
      <div className="px-4 pt-3">
        <div className="tm-card flex items-start gap-3 !rounded-2xl border border-grab/25 !p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-grab-soft text-grab-deep">
            <Info size={17} />
          </span>
          <div className="min-w-0">
            <p className="text-[12.5px] font-bold text-navy">{t('rent.infoTitle')}</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{t('rent.infoBody')}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-3">
        <p className="mb-2.5 text-[11.5px] text-muted">
          <strong className="text-navy tnum">{results.length}</strong> {t('rent.products')} ·{' '}
          <span className="text-faint">{t('rent.catalogue')}</span>
        </p>

        <div className="grid grid-cols-2 gap-3">
          {results.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="tm-card group tm-rise overflow-hidden !p-0 transition-all duration-200 hover:shadow-[var(--shadow-float)] active:scale-[0.98]"
            >
              <div className="relative aspect-square overflow-hidden bg-white">
                <ProductThumb
                  product={product}
                  className="h-full w-full transition-transform duration-300 group-hover:scale-[1.04]"
                  rounded="rounded-none"
                  glyphSize="text-5xl"
                />
                {!product.inStock && (
                  <span className="absolute inset-0 flex items-center justify-center bg-white/75 text-[12px] font-bold text-muted">
                    {t('rent.outOfStock')}
                  </span>
                )}
                <span className="absolute top-2 left-2">
                  <SimulatedTag compact />
                </span>
                <span className="absolute top-2 right-2">
                  <Badge tone="info" className="!bg-white/90 !text-brand-700 shadow-sm tnum">
                    {pct(product.rewardRate, 2)}
                  </Badge>
                </span>
              </div>

              <div className="p-2.5">
                <p className="truncate text-[12.5px] leading-tight font-bold text-navy">{product.name}</p>
                <p className="mt-0.5 truncate text-[10.5px] text-muted">{product.subtitle}</p>
                <div className="mt-1.5 flex items-center justify-between gap-1">
                  <span className="text-[13.5px] font-extrabold tnum text-amount">{lkr(product.price)}</span>
                  <span className="flex items-center gap-0.5 text-[10.5px] font-semibold tnum text-muted">
                    <Star size={10} className="fill-[#fbbf24] text-[#fbbf24]" />
                    {product.rating}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-1.5">
                  <span
                    className={cx(
                      'text-[10px] font-semibold',
                      product.taskSlots > 0 ? 'text-ok' : 'text-faint',
                    )}
                  >
                    {product.taskSlots > 0 ? (
                      <>
                        {product.taskSlots} {t('common.tasks')}
                      </>
                    ) : (
                      t('rent.noTasks')
                    )}
                  </span>
                  <span className="tm-grab flex h-[22px] items-center rounded-full px-2.5 text-[10px] font-extrabold tracking-wide text-white shadow-[0_2px_8px_rgba(234,88,12,0.35)]">
                    {t('rent.grab')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {results.length === 0 && (
          <EmptyState
            icon={<PackageSearch size={28} />}
            title={t('rent.empty')}
            body={t('rent.emptyBody')}
          />
        )}
      </div>
    </div>
  )
}
