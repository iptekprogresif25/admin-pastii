'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Button from '@/components/ui/button/Button';
import { updateProfile } from '../../actions';

interface EditProfileFormProps {
  profile: any;
  divisions: any[];
}

export default function EditProfileForm({ profile, divisions }: EditProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    role: profile.role || 'MEMBER',
    division_id: profile.division_id ? profile.division_id.toString() : '',
    nim: profile.nim || '',
    angkatan: profile.angkatan || '',
    no_hp: profile.no_hp || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const payload = {
      ...formData,
      division_id: formData.division_id ? parseInt(formData.division_id) : null,
    };

    const res = await updateProfile(profile.id, payload);
    
    if (res.success) {
      router.push('/admin/profiles');
      router.refresh();
    } else {
      setError(res.error || 'Terjadi kesalahan saat menyimpan data.');
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    { value: 'MEMBER', label: 'Member' },
    { value: 'KOORDINATOR', label: 'Koordinator' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  const divisionOptions = [
    { value: '', label: 'Tanpa Divisi' },
    ...divisions.map(d => ({ value: d.id.toString(), label: d.name }))
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 mb-4 text-sm text-error-800 rounded-lg bg-error-50 dark:bg-gray-800 dark:text-error-400">
            {error}
          </div>
        )}
        
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nama Lengkap
          </label>
          <Input 
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Masukkan nama lengkap"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              NIM
            </label>
            <Input 
              name="nim"
              value={formData.nim}
              onChange={handleChange}
              placeholder="Masukkan NIM"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Angkatan
            </label>
            <Input 
              name="angkatan"
              value={formData.angkatan}
              onChange={handleChange}
              placeholder="Contoh: 2021"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Peran (Role)
            </label>
            <Select
              options={roleOptions}
              defaultValue={formData.role}
              onChange={(val) => setFormData({ ...formData, role: val })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Divisi
            </label>
            <Select
              options={divisionOptions}
              defaultValue={formData.division_id}
              onChange={(val) => setFormData({ ...formData, division_id: val })}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nomor HP
          </label>
          <Input 
            name="no_hp"
            value={formData.no_hp}
            onChange={handleChange}
            placeholder="Contoh: 081234567890"
          />
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="outline" onClick={() => router.push('/admin/profiles')}>
            Batal
          </Button>
          <Button variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </div>
  );
}
