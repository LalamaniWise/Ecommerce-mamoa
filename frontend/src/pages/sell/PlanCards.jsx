import React from 'react'
import { formatPrice } from '../../utils/format'

// Rental plan cards. If onSelect is given they act as a picker.
const PlanCards = ({ plans = [], selectedId, onSelect, actionLabel = 'Choose plan', currentId }) => (
  <div className='grid gap-6 md:grid-cols-3'>
    {plans.map((plan) => {
      const selected = selectedId === plan._id
      return (
        <div key={plan._id}
          className={`relative flex flex-col rounded-xl border-2 bg-white p-6 shadow-sm transition ${selected ? 'border-primary' : plan.highlighted ? 'border-primary/40' : 'border-gray-200'}`}>
          {plan.highlighted && <span className='absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-white'>Most popular</span>}
          <h4 className='text-xl font-bold'>{plan.name}</h4>
          {plan.description && <p className='text-sm text-text-light'>{plan.description}</p>}
          <p className='my-4'><span className='text-3xl font-extrabold'>{formatPrice(plan.priceMonthly)}</span><span className='text-text-light'> / month</span></p>
          <ul className='mb-6 flex-1 space-y-2 text-sm'>
            {(plan.features || []).map((f) => <li key={f}><i className='ri-check-line text-green-600'></i> {f}</li>)}
          </ul>
          {onSelect && (
            <button type='button' onClick={() => onSelect(plan)}
              disabled={currentId === plan._id && !selected && actionLabel !== 'Choose plan'}
              className={`rounded-md py-2 font-medium ${selected ? 'bg-primary text-white' : 'border border-primary text-primary hover:bg-primary hover:text-white'}`}>
              {selected ? <><i className='ri-check-line'></i> Selected</> : currentId === plan._id ? 'Current plan' : actionLabel}
            </button>
          )}
        </div>
      )
    })}
  </div>
)

export default PlanCards
