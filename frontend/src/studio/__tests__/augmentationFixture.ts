export const augmentationCatalog = (ready = true) => ({
  ready, storage_free_bytes: 100 * 1024 ** 3, storage_total_bytes: 500 * 1024 ** 3,
  items: ['mit_rirs_16k', 'audioset_16k', 'fma_16k', 'chime_16k'].map((id, index) => ({
    id, selected: true, name: ['MIT room impulse responses', 'AudioSet', 'Free Music Archive', 'CHiME-Home'][index],
    description: 'Shared augmentation audio', source: 'Source archive', license: 'See source terms',
    status: ready ? 'installed' : 'available', installed_bytes: ready ? 1000 : null,
    download_bytes: null, file_count: ready ? 1 : null, job_id: null, error_code: null,
  })),
});
