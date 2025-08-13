import type { FUniver } from '@univerjs/presets'

import {
  setupSaveSheet,
  setupResetSheet,
} from './api'

export function setupToolbar() {
  const $toolbar = document.getElementById('toolbar')!
  console.log('lhh-log:setupToolbar', $toolbar);
  setupSaveSheet($toolbar)
  setupResetSheet($toolbar)
}
