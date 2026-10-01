import { useMemo, useState } from 'react'
import { Pencil, Search, ShoppingBag } from 'lucide-react'
import { AdminPageHeader } from '../../components/admin/AdminShell'
import { DataTable, StatCard, type Column } from '../../components/admin/DataTable'
import { Button, Field, SelectField, Toggle } from '../../components/ui/primitives'
import { Badge, SimulatedTag } from '../../components/ui/Badge'
import { Sheet } from '../../components/ui/Modal'
import { ChipRail } from '../../components/ui/Tabs'
import { ProductThumb } from '../../components/product/ProductThumb'
import { useApp } from '../../store/AppContext'
import { CATEGORIES, type Category, type Product } from '../../data/types'
import { count, lkr, lkrShort, pct } from '../../lib/format'

type Filter = 'All' | Category

export default function AdminProducts() {
  const { state, dispatch, toast } = useApp()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('All')
  const [editing, setEditing] = useState<Product | null>(null)
  const [draft, setDraft] = useState({ price: 0, rewardRate: 0, taskSlots: 0, active: true, category: 'Food' as Category })

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return state.products.filter((p) => {
      const matchesFilter = filter === 'All' || p.category === filter
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
      return matchesFilter && matchesQuery
    })
  }, [state.products, query, filter])

  const summary = useMemo(
    () => ({
      total: state.products.length,
      active: state.products.filter((p) => p.active).length,
      slots: state.products.reduce((s, p) => s + p.taskSlots, 0),
      avgRate: state.products.reduce((s, p) => s + p.rewardRate, 0) / Math.max(1, state.products.length),
    }),
    [state.products],
  )

  function openEditor(product: Product) {
    setEditing(product)
    setDraft({
      price: product.price,
      rewardRate: product.rewardRate,
      taskSlots: product.taskSlots,
      active: product.active,
      category: product.category,
    })
  }

  function save() {
    if (!editing) return
    dispatch({
      type: 'admin/productPatch',
      id: editing.id,
      patch: {
        price: Number(draft.price) || editing.price,
        rewardRate: Number(draft.rewardRate) || editing.rewardRate,
        taskSlots: Number(draft.taskSlots),
        active: draft.active,
        category: draft.category,
      },
    })
    toast({ title: `${editing.name} updated`, tone: 'ok' })
    setEditing(null)
  }

  const columns: Column<Product>[] = [
    {
      key: 'product',
      header: 'Product',
      render: (p) => (
        <div className="flex items-center gap-2.5">
          <ProductThumb
            product={p}
            className="h-9 w-9 shrink-0 ring-1 ring-hairline"
            rounded="rounded-[9px]"
            glyphSize="text-base"
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-navy">{p.name}</p>
            <p className="truncate text-[11px] tnum text-muted">{p.id}</p>
          </div>
        </div>
      ),
    },
    { key: 'category', header: 'Category', hideBelow: 'sm', render: (p) => <Badge tone="muted">{p.category}</Badge> },
    {
      key: 'price',
      header: 'Price',
      align: 'right',
      render: (p) => <span className="tnum font-bold text-amount">{lkr(p.price)}</span>,
    },
    {
      key: 'rate',
      header: 'Reward rate',
      align: 'right',
      render: (p) => <span className="tnum font-bold text-reward">{pct(p.rewardRate)}</span>,
    },
    {
      key: 'slots',
      header: 'Task availability',
      align: 'right',
      hideBelow: 'md',
      render: (p) => (
        <span className={p.taskSlots > 0 ? 'tnum text-ok' : 'tnum text-faint'}>{p.taskSlots} slots</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <Badge tone={p.active && p.inStock ? 'ok' : 'muted'} dot>
          {p.active && p.inStock ? 'Active' : p.inStock ? 'Paused' : 'Out of stock'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (p) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            openEditor(p)
          }}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11.5px] font-semibold text-brand-700 transition-colors hover:bg-brand-50"
        >
          <Pencil size={13} /> Edit
        </button>
      ),
    },
  ]

  return (
    <div>
      <AdminPageHeader
        icon={ShoppingBag}
        title="Products"
        description="Catalogue, pricing, task availability and simulated reward rates"
        actions={<SimulatedTag />}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Products" value={count(summary.total)} tone="brand" icon={<ShoppingBag size={18} />} />
        <StatCard label="Active" value={count(summary.active)} tone="ok" />
        <StatCard label="Task slots" value={count(summary.slots)} tone="navy" />
        <StatCard label="Avg reward rate" value={pct(summary.avgRate)} tone="pending" />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
          <input
            className="tm-field pl-9"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
          />
        </div>
        <ChipRail
          value={filter}
          onChange={setFilter}
          items={[{ key: 'All' as Filter, label: 'All' }, ...CATEGORIES.map((c) => ({ key: c as Filter, label: c }))]}
        />
      </div>

      <DataTable columns={columns} rows={rows} rowKey={(p) => p.id} onRowClick={openEditor} />

      <Sheet
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing ? `Edit · ${editing.name}` : ''}
        maxWidth="max-w-[460px]"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save}>Save changes</Button>
          </div>
        }
      >
        {editing && (
          <div className="space-y-3.5">
            <div className="flex items-center gap-3 rounded-xl bg-canvas p-3">
              <ProductThumb product={editing} className="h-14 w-14 shrink-0 ring-1 ring-hairline" glyphSize="text-xl" />
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-bold text-navy">{editing.name}</p>
                <p className="text-[11px] tnum text-muted">{editing.id}</p>
                <p className="text-[11px] text-faint">
                  {editing.brand} · {editing.weightKg} kg · {editing.packageType}
                </p>
              </div>
            </div>

            <Field
              label="Price (LKR)"
              type="number"
              value={draft.price}
              onChange={(e) => setDraft((d) => ({ ...d, price: Number(e.target.value) }))}
            />
            <Field
              label="Reward rate (decimal, e.g. 0.03 = 3.00%)"
              type="number"
              step="0.001"
              value={draft.rewardRate}
              onChange={(e) => setDraft((d) => ({ ...d, rewardRate: Number(e.target.value) }))}
              hint={`Simulated reward on one unit: ${lkrShort(draft.price * draft.rewardRate)}`}
            />
            <Field
              label="Task availability (slots)"
              type="number"
              value={draft.taskSlots}
              onChange={(e) => setDraft((d) => ({ ...d, taskSlots: Number(e.target.value) }))}
            />
            <SelectField
              label="Category"
              value={draft.category}
              onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as Category }))}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </SelectField>

            <div className="flex items-center justify-between rounded-xl border border-hairline px-3 py-2.5">
              <div>
                <p className="text-[13px] font-semibold text-navy">Status</p>
                <p className="text-[11.5px] text-muted">{draft.active ? 'Active in the catalogue' : 'Hidden / paused'}</p>
              </div>
              <Toggle checked={draft.active} label="Product active" onChange={(v) => setDraft((d) => ({ ...d, active: v }))} />
            </div>
          </div>
        )}
      </Sheet>
    </div>
  )
}
