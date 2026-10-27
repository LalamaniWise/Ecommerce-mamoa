import React from 'react'
import { Field, inputClass } from './ui'

// Card form for the FAKE payment gateway. Nothing is charged.
const CardFields = ({ card, setCard }) => {
  const update = (key) => (e) => {
    let v = e.target.value
    if (key === 'number') v = v.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ')
    if (key === 'expiry') v = v.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2')
    if (key === 'cvc') v = v.replace(/\D/g, '').slice(0, 4)
    setCard({ ...card, [key]: v })
  }

  return (
    <div className='space-y-3'>
      <div className='rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800'>
        <i className='ri-information-line'></i> Test mode — no real money is taken. Use card <b>4242 4242 4242 4242</b>,
        any future date and any CVC. Card <b>4000 0000 0000 0002</b> shows a decline.
      </div>
      <Field label='Name on card'>
        <input className={inputClass} value={card.name || ''} onChange={update('name')} required autoComplete='cc-name' />
      </Field>
      <Field label='Card number'>
        <input className={inputClass} value={card.number || ''} onChange={update('number')} required
          inputMode='numeric' placeholder='4242 4242 4242 4242' autoComplete='cc-number' />
      </Field>
      <div className='grid grid-cols-2 gap-3'>
        <Field label='Expiry (MM/YY)'>
          <input className={inputClass} value={card.expiry || ''} onChange={update('expiry')} required placeholder='12/28' autoComplete='cc-exp' />
        </Field>
        <Field label='CVC'>
          <input className={inputClass} value={card.cvc || ''} onChange={update('cvc')} required inputMode='numeric' placeholder='123' autoComplete='cc-csc' />
        </Field>
      </div>
    </div>
  )
}

export default CardFields
