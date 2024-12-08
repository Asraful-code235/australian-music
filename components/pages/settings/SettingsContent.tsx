import React from 'react';
import SettingsForm from './settings-form';

export default function SettingsContent() {
  return (
    <div>
      <div>
        <h1 className='text-xl lg:text-3xl font-bold'>Settings</h1>
      </div>
      <div className='mt-10'>
        <SettingsForm />
      </div>
    </div>
  );
}
