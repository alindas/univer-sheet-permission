import type { FUniver } from '@univerjs/presets';
import DataStore from './store.js'
import { initSheet } from './setup-univer.js';

// 保存后会清空当前表，下次直接加载
export function setupSaveSheet($toolbar: HTMLElement) {

  const $button = document.createElement('a')
  $button.textContent = '点我：保存当前表的数据，点击旁边的按钮基于保存的数据进行重新加载';
  $toolbar.appendChild($button)

  $button.addEventListener('click', async () => {
    const sheetData = window.univerAPIInstance?.getActiveWorkbook().save()
    DataStore.set('sheetData', sheetData)
    window.univerInstance?.dispose()
    window.univerAPIInstance?.dispose()
    window.univerInstance = null
    window.univerAPIInstance = null
    alert('数据已保存')
  })
}

// 基于保存的数据重新加载报表
export function setupResetSheet($toolbar: HTMLElement) {

  const $button = document.createElement('a')
  $button.textContent = '点我：基于保存的数据重新加载报表';
  $toolbar.appendChild($button)

  $button.addEventListener('click', async () => {
    initSheet()
    const sheetData = DataStore.get('sheetData')
    if (sheetData) {
      window.univerInstance.createUnit(2, sheetData)
    }

  })
}