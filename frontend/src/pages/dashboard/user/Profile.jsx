import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DashTitle } from '../DashboardLayout'
import ImageUpload from '../../../components/common/ImageUpload'
import { Field, SuccessBox, ErrorBox, inputClass } from '../../../components/common/ui'
import { useEditProfileMutation } from '../../../redux/features/auth/authApi'
import { setUser } from '../../../redux/features/auth/authSlice'
import { errorMessage } from '../../../utils/format'

const Profile = () => {
  const { user } = useSelector((s) => s.auth)
  const dispatch = useDispatch()
  const [editProfile, { isLoading }] = useEditProfileMutation()
  const [form, setForm] = useState({
    username: user.username || '', phone: user.phone || '', profession: user.profession || '',
    bio: user.bio || '', profileImage: user.profileImage || '',
  })
  const [msg, setMsg] = useState(null)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg(null)
    try {
      const res = await editProfile(form).unwrap()
      dispatch(setUser({ user: res.user }))
      setMsg({ ok: true, text: 'Profile saved' })
    } catch (err) {
      setMsg({ ok: false, text: errorMessage(err) })
    }
  }

  return (
    <>
      <DashTitle title='Profile'>{user.email}</DashTitle>
      <form onSubmit={handleSubmit} className='max-w-2xl space-y-5 rounded-lg border bg-white p-6'>
        {msg && (msg.ok ? <SuccessBox>{msg.text}</SuccessBox> : <ErrorBox>{msg.text}</ErrorBox>)}
        <ImageUpload label='Profile picture' value={form.profileImage} onChange={(profileImage) => setForm({ ...form, profileImage })} previewClass='h-24 w-24 rounded-full' />
        <div className='grid gap-4 sm:grid-cols-2'>
          <Field label='Name'><input className={inputClass} value={form.username} onChange={set('username')} required /></Field>
          <Field label='Phone'><input className={inputClass} value={form.phone} onChange={set('phone')} type='tel' /></Field>
        </div>
        <Field label='Profession'><input className={inputClass} value={form.profession} onChange={set('profession')} /></Field>
        <Field label='Bio' hint='Max 200 characters'><textarea className={inputClass} rows={3} maxLength={200} value={form.bio} onChange={set('bio')} /></Field>
        <button disabled={isLoading} className='btn disabled:opacity-60'>{isLoading ? 'Saving...' : 'Save profile'}</button>
      </form>
    </>
  )
}

export default Profile
