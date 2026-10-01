import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Box, Check, ChevronRight, Minus, Plus, Star, Truck } from 'lucide-react'
import { ScreenHeader } from '../../components/layout/Headers'
import { Button, Card, DataRow, Divider, EmptyState, SectionTitle } from '../../components/ui/primitives'
import { Badge, DemoNotice, SimulatedTag } from '../../components/ui/Badge'
import { Sheet } from '../../components/ui/Modal'
import { ProductThumb } from '../../components/product/ProductThumb'
import { useApp, useProduct, useWalletTotals } from '../../store/AppContext'
import { useLang } from '../../lib/i18n'
import { lkr, pct } from '../../lib/format'
import { shippingFeeFor } from '../../data/packages'

export default function ProductDetails() {
  const { productId } = useParams()
  const product = useProduct(productId)
  const { state, dispatch, toast } = useApp()
  const { t } = useLang()
  const { available } = useWalletTotals()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (!product) {
    return (
      <div className="pb-24">
        <ScreenHeader title="Product Details" />
        <EmptyState icon={<Box size={28} />} title="Product not found" body="This catalogue item is unavailable." />
      </div>
    )
  }

  const amount = product.price * quantity
  const reward = Math.round(amount * product.rewardRate * 100) / 100
  const canAfford = amount <= available
  const taskable = product.active && product.inStock

  function startTask() {
    dispatch({ type: 'order/accept', productId: product!.id, quantity })
    setConfirmOpen(false)
    toast({
      title: 'Simulated order created',
      body: `${lkr(amount)} of simulated capital is now held. Complete the task to release it with the reward.`,
      tone: 'ok',
    })
    navigate('/revenue?tab=pending')
  }

  return (
    <div className="pb-28">
      <ScreenHeader title="Product Details" />

      {/* Hero image */}
      <div className="bg-white px-4 pt-2 pb-4">
        <div className="relative overflow-hidden rounded-[18px] bg-canvas">
          <ProductThumb
            product={product}
            className="aspect-square w-full"
            rounded="rounded-[18px]"
            glyphSize="text-[90px]"
          />
          <span className="absolute top-3 left-3">
            <Badge tone={product.inStock ? 'ok' : 'muted'} dot>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </Badge>
          </span>
        </div>
      </div>

      <div className="space-y-3 px-4">
        <Card>
          <p className="text-[11px] font-semibold tracking-[0.06em] text-brand-700 uppercase">{product.brand}</p>
          <h1 className="mt-0.5 text-[19px] leading-tight font-extrabold tracking-[-0.01em] text-navy">
            {product.name}
          </h1>
          <p className="mt-0.5 text-[12.5px] text-muted">{product.subtitle}</p>

          <div className="mt-2 flex items-center gap-2">
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  size={13}
                  className={
                    i < Math.round(product.rating) ? 'fill-[#fbbf24] text-[#fbbf24]' : 'fill-[#e8edf5] text-[#e8edf5]'
                  }
                />
              ))}
            </span>
            <span className="text-[12px] font-bold tnum text-navy">{product.rating}</span>
            <span className="text-[11.5px] text-faint">({product.reviews.toLocaleString()} reviews)</span>
          </div>

          <div className="mt-3 flex items-end justify-between gap-2">
            <div>
              <p className="text-[24px] leading-none font-extrabold tnum text-amount">{lkr(product.price)}</p>
              <div className="mt-1.5">
                <SimulatedTag />
              </div>
            </div>
            <div className="rounded-xl bg-brand-50 px-3 py-2 text-right">
              <p className="text-[10.5px] font-semibold text-brand-700">Reward rate</p>
              <p className="text-[16px] leading-tight font-extrabold tnum text-reward">{pct(product.rewardRate)}</p>
            </div>
          </div>

          <p className="mt-3 text-[12.5px] leading-relaxed text-muted">{product.description}</p>
        </Card>

        <Card>
          <SectionTitle>Product Information</SectionTitle>
          <div className="divide-y divide-hairline">
            <DataRow label="Product ID" value={product.id} mono />
            <DataRow label="Brand" value={product.brand} />
            <DataRow label="Category" value={product.category} />
            <DataRow label="Weight" value={`${(product.weightKg * 1000).toFixed(0)} g`} />
            <DataRow label="Package Type" value={product.packageType} />
            <DataRow
              label="Available"
              value={product.inStock ? `In Stock (${product.stock})` : 'Out of Stock'}
              accent={product.inStock ? 'ok' : 'muted'}
            />
            <DataRow label="Task slots" value={`${product.taskSlots} remaining`} />
          </div>

          {product.highlights.length > 0 && (
            <>
              <Divider className="my-3" />
              <ul className="space-y-1.5">
                {product.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-[12.5px] text-ink">
                    <Check size={14} className="shrink-0 text-ok" />
                    {h}
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>

        <Link
          to={`/products/${product.id}/package`}
          className="tm-card flex items-center gap-3 !p-3.5 transition-transform active:scale-[0.99]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-brand-50 text-brand-600">
            <Truck size={19} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-bold text-navy">View Package Information</p>
            <p className="text-[11.5px] text-muted">
              {product.packageType} · {product.weightKg} kg · {lkr(shippingFeeFor(product.packageType))} shipping
            </p>
          </div>
          <ChevronRight size={16} className="text-faint" />
        </Link>

        {/* Quantity + task */}
        <Card>
          <SectionTitle>{t('product.grabTitle')}</SectionTitle>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-muted">{t('product.quantity')}</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline text-navy disabled:opacity-40"
              >
                <Minus size={15} />
              </button>
              <span className="w-6 text-center text-[15px] font-bold tnum text-navy">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => Math.min(5, q + 1))}
                disabled={quantity >= 5}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline text-navy disabled:opacity-40"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          <Divider className="my-3" />

          <div className="divide-y divide-hairline">
            <DataRow label={t('order.amount')} value={lkr(amount)} accent="amount" />
            <DataRow label={t('product.rewardRate')} value={pct(product.rewardRate)} />
            <DataRow label={t('order.simulatedReward')} value={lkr(reward)} accent="reward" />
            <DataRow
              label={t('product.availableBalance')}
              value={lkr(available)}
              accent={canAfford ? 'ok' : 'amount'}
            />
          </div>

          <Button
            size="lg"
            block
            className="tm-grab mt-4 !shadow-[0_6px_18px_rgba(234,88,12,0.35)]"
            disabled={!taskable || !canAfford}
            onClick={() => setConfirmOpen(true)}
          >
            {!taskable ? t('product.grabUnavailable') : canAfford ? t('product.grab') : t('product.grabInsufficient')}
          </Button>

          <p className="mt-2.5 text-[11px] leading-relaxed text-muted">{t('product.grabNote')}</p>
        </Card>

        <DemoNotice>
          This catalogue exists to demonstrate order flow. Products are not purchasable and no reward shown here is
          withdrawable.
        </DemoNotice>
      </div>

      <Sheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t('product.confirmTitle')}
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={startTask}>{t('product.createOrder')}</Button>
          </div>
        }
      >
        <div className="flex gap-3 rounded-xl bg-canvas p-3">
          <ProductThumb product={product} className="h-14 w-14 shrink-0 ring-1 ring-hairline" glyphSize="text-xl" />
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-bold text-navy">{product.name}</p>
            <p className="text-[11.5px] text-muted">
              Qty {quantity} · {product.id}
            </p>
          </div>
        </div>
        <div className="mt-3 divide-y divide-hairline">
          <DataRow label="Order amount (held)" value={lkr(amount)} accent="amount" />
          <DataRow label="Expected reward" value={lkr(reward)} accent="reward" />
          <DataRow label="Effective time" value="24 hours" />
          <DataRow label="Balance after hold" value={lkr(available - amount)} />
        </div>
        <DemoNotice className="mt-3">
          Simulation only. Held capital is released back automatically — TaskMall never asks you to deposit money to
          unlock a task or release earnings.
        </DemoNotice>
        <p className="mt-2 text-[11px] text-faint">
          Current wallet: {lkr(available)} available · {lkr(state.wallet.pending)} already held.
        </p>
      </Sheet>
    </div>
  )
}
