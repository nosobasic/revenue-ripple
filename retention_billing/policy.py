"""Strict paid coverage policy; no provider or database writes."""
from dataclasses import dataclass
from datetime import datetime, timezone
import calendar
from .types import ReviewRequired, object_id, LIVE_SCOPE, LIVE_CATALOG


@dataclass(frozen=True)
class Settlement:
    start: int | None = None
    end: int | None = None
    invoice_id: str | None = None
    payment_intent: str | None = None
    charge: str | None = None


def require(condition, reason):
    if not condition:raise ReviewRequired(reason)


def month_after(timestamp, anchor=None):
    start=datetime.fromtimestamp(timestamp,timezone.utc)
    base=datetime.fromtimestamp(anchor if anchor is not None else timestamp,timezone.utc)
    if anchor is not None:
        require(start.day==min(base.day,calendar.monthrange(start.year,start.month)[1])
            and (start.hour,start.minute,start.second)==(base.hour,base.minute,base.second)
            and timestamp>=anchor,'unapproved_billing_anchor')
    year=start.year+(start.month==12);month=start.month%12+1
    return int(start.replace(year=year,month=month,
        day=min(base.day,calendar.monthrange(year,month)[1])).timestamp())


class PaidPolicy:
    def __init__(self, scope=LIVE_SCOPE, catalog=LIVE_CATALOG):
        self.scope=scope
        self.price,self.product=catalog
    def decide(self, binding, sub, invoice, provider):
        require(binding.scope == self.scope and (binding.price,binding.product)==(self.price,self.product),
                'unapproved_exact_catalog')
        require(provider.scope==binding.scope,'provider_scope_mismatch')
        require(sub.get('id')==binding.subscription and object_id(sub.get('customer'))==binding.customer
            and sub.get('livemode') is binding.scope.live,'subscription_owner_mismatch')
        items=sub.get('items') or {}
        require(items.get('has_more') is False and len(items.get('data',[]))==1,'subscription_items_incomplete')
        item=items['data'][0];price=item['price']
        require(price.get('id')==binding.price and object_id(price.get('product'))==binding.product
            and type(item.get('quantity')) is int and item['quantity']==1,'subscription_catalog_mismatch')
        require(type(price.get('unit_amount')) is int and price.get('unit_amount')==4700 and price.get('currency')=='usd'
            and price.get('recurring')=={'interval':'month','interval_count':1,'usage_type':'licensed'}
            and price.get('billing_scheme')=='per_unit','unsupported_price_terms')
        require(not sub.get('pending_update') and not sub.get('trial_start') and not sub.get('trial_end')
            and not sub.get('pause_collection') and sub['status'] in ('active','past_due','unpaid','canceled'),
            'unsupported_subscription_change')
        if invoice is None:return Settlement()
        parent=object_id((invoice.get('parent') or {}).get('subscription_details',{}).get('subscription'))
        legacy=object_id(invoice.get('subscription'))
        require((parent or legacy)==binding.subscription and (not parent or not legacy or parent==legacy)
            and object_id(invoice.get('customer'))==binding.customer
            and invoice.get('livemode') is binding.scope.live,'invoice_owner_mismatch')
        if invoice.get('status') in ('open','draft','void','uncollectible'):
            # Failure/void never removes previously verified paid coverage or extends it.
            return Settlement()
        require(invoice.get('status')=='paid','invoice_not_settled')
        require(invoice.get('collection_method')=='charge_automatically'
            and invoice.get('billing_reason') in ('subscription_create','subscription_cycle'),
            'unsupported_invoice_reason')
        require(invoice.get('paid_out_of_band') is not True,'manual_payment_requires_review')
        require(invoice.get('currency')=='usd'
            and all(type(invoice.get(k)) is int and invoice[k]==4700 for k in ('amount_due','amount_paid','total'))
            and invoice.get('amount_remaining')==0
            and invoice.get('starting_balance')==0 and invoice.get('ending_balance')==0
            and not invoice.get('total_discount_amounts') and not invoice.get('total_taxes')
            and not invoice.get('pre_payment_credit_notes_amount') and not invoice.get('post_payment_credit_notes_amount'),
            'unsupported_invoice_amount_or_adjustments')
        lines=invoice.get('lines') or {};rows=lines.get('data') or []
        require(lines.get('has_more') is False and len(rows)==1,'incomplete_or_mixed_invoice_lines')
        line=rows[0];parent=line.get('parent') or {};details=parent.get('subscription_item_details') or {}
        require(parent.get('type')=='subscription_item_details' and details.get('proration') is False
            and object_id(details.get('subscription'))==binding.subscription
            and object_id(details.get('subscription_item'))==item.get('id') and bool(item.get('id')),
            'proration_or_line_owner_requires_review')
        pricing=line.get('pricing') or {};catalog=pricing.get('price_details') or {}
        require(pricing.get('type')=='price_details' and object_id(catalog.get('price'))==binding.price
            and object_id(catalog.get('product'))==binding.product
            and type(line.get('quantity')) is int and line.get('quantity')==1 and line.get('amount')==4700 and line.get('currency')=='usd',
            'invoice_catalog_mismatch')
        period=line.get('period') or {};start,end=period.get('start'),period.get('end')
        require(type(start) is int and type(end) is int and 0<start<end,'invalid_paid_period')
        anchor=sub.get('billing_cycle_anchor')
        require(type(anchor) is int and anchor>0,'missing_billing_anchor')
        try:monthly=month_after(start,anchor)==end
        except (ValueError,OverflowError,OSError):monthly=False
        require(monthly,'nonmonthly_period_requires_review')
        if sub['status']=='canceled':
            require(type(sub.get('canceled_at')) is int and start<sub['canceled_at'],
                    'paid_period_after_cancellation_requires_review')
        # Basil removed invoice.paid/payment_intent/paid_out_of_band. Validate the
        # complete InvoicePayment allocation and canonical PaymentIntent instead.
        payments=invoice.get('payments') or {};allocations=payments.get('data') or []
        require(payments.get('has_more') is False and len(allocations)==1,'ambiguous_invoice_payments')
        allocation=allocations[0];payment=allocation.get('payment') or {}
        require(allocation.get('status')=='paid' and allocation.get('amount_paid')==4700
            and object_id(allocation.get('invoice'))==invoice['id']
            and payment.get('type')=='payment_intent' and bool(object_id(payment.get('payment_intent'))),
            'manual_or_partial_payment_requires_review')
        ident=object_id(payment['payment_intent']);pi=provider.payment_intent(ident)
        require(pi.get('id')==ident and pi.get('livemode') is binding.scope.live and object_id(pi.get('customer'))==binding.customer
            and pi.get('status')=='succeeded' and pi.get('currency')=='usd'
            and pi.get('amount')==4700 and pi.get('amount_received')==4700,
            'payment_not_verified')
        charge_id=object_id(pi.get('latest_charge'))
        require(bool(charge_id),'missing_settlement_charge')
        charge=provider.charge(charge_id)
        require(charge.get('id')==charge_id and charge.get('livemode') is binding.scope.live
            and object_id(charge.get('payment_intent'))==ident
            and object_id(charge.get('customer'))==binding.customer
            and charge.get('status')=='succeeded' and charge.get('paid') is True
            and charge.get('captured') is True and charge.get('amount_captured')==4700
            and charge.get('amount')==4700 and charge.get('currency')=='usd',
            'charge_not_verified')
        require(charge.get('refunded') is False and charge.get('amount_refunded')==0
            and charge.get('disputed') is False,'refund_or_dispute_manual_review')
        require(not provider.payment_reviews(charge_id),'refund_or_dispute_manual_review')
        return Settlement(start,end,invoice['id'],ident,charge_id)
