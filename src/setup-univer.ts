import {
  createUniver,
  defaultTheme,
  IAuthzIoService,
  LocaleType,
  LogLevel,
  merge,
} from '@univerjs/presets'

import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core'
import sheetsCoreZhCn from '@univerjs/presets/preset-sheets-core/locales/zh-CN'
import '@univerjs/presets/lib/styles/preset-sheets-core.css'

import sheetsThreadCommentZhCn from '@univerjs/presets/preset-sheets-thread-comment/locales/zh-CN'
import '@univerjs/presets/lib/styles/preset-sheets-thread-comment.css'

import { UniverSheetsConditionalFormattingPreset } from '@univerjs/presets/preset-sheets-conditional-formatting'
import sheetsConditionalFormattingZhCn from '@univerjs/presets/preset-sheets-conditional-formatting/locales/zh-CN'
import '@univerjs/presets/lib/styles/preset-sheets-conditional-formatting.css'

import { UniverSheetsDataValidationPreset } from '@univerjs/presets/preset-sheets-data-validation'
import sheetsDataValidationZhCn from '@univerjs/presets/preset-sheets-data-validation/locales/zh-CN'
import '@univerjs/presets/lib/styles/preset-sheets-data-validation.css'

import { UniverSheetsDrawingPreset } from '@univerjs/presets/preset-sheets-drawing'
import sheetsDrawingZhCn from '@univerjs/presets/preset-sheets-drawing/locales/zh-CN'
import '@univerjs/presets/lib/styles/preset-sheets-drawing.css'

import { UniverSheetsFilterPreset } from '@univerjs/presets/preset-sheets-filter'
import sheetsFilterZhCn from '@univerjs/presets/preset-sheets-filter/locales/zh-CN'
import '@univerjs/presets/lib/styles/preset-sheets-filter.css'

import { UniverSheetsFindReplacePreset } from '@univerjs/presets/preset-sheets-find-replace'
import sheetsFindReplaceZhCn from '@univerjs/presets/preset-sheets-find-replace/locales/zh-CN'
import '@univerjs/presets/lib/styles/preset-sheets-find-replace.css'

import { UniverSheetsHyperLinkPreset } from '@univerjs/presets/preset-sheets-hyper-link'
import sheetsHyperLinkZhCn from '@univerjs/presets/preset-sheets-hyper-link/locales/zh-CN'
import '@univerjs/presets/lib/styles/preset-sheets-hyper-link.css'

import { UniverSheetsSortPreset } from '@univerjs/presets/preset-sheets-sort'
import sheetsSortZhCn from '@univerjs/presets/preset-sheets-sort/locales/zh-CN'
import '@univerjs/presets/lib/styles/preset-sheets-sort.css'

import { UniverSheetsNotePreset } from '@univerjs/presets/preset-sheets-note'
import sheetsNoteZhCn from '@univerjs/presets/preset-sheets-note/locales/zh-CN'
import '@univerjs/presets/lib/styles/preset-sheets-note.css'

import { UniverSheetsTablePreset } from '@univerjs/presets/preset-sheets-table'
import sheetsTableZhCn from '@univerjs/presets/preset-sheets-table/locales/zh-CN'
import '@univerjs/presets/lib/styles/preset-sheets-table.css'
import { MyAuthzPlugin } from './authz'
import DataStore from './store'

interface User {
  userID: string,
  name: string,
  avatar?: string,
}

interface SetupSheetProps {
  container: HTMLElement,
  owner?: User,
  injectStyle?: CSSStyleSheet
}

export function setupSheet({container, owner, injectStyle}: SetupSheetProps) {

  if (!container) {
    throw new Error('container is required')
  }

  let shadowEle = null
  // shadow dom 进行样式隔离
  if (injectStyle) {
    const shadowRoot = container.attachShadow({ mode: 'open' })
    // const styleSheet = new CSSStyleSheet();
    // styleSheet.replaceSync(injectStyle);
    shadowRoot.adoptedStyleSheets = [injectStyle];
  
    shadowEle = document.createElement('div');
    shadowEle.style.height = '100%';
    shadowRoot.appendChild(shadowEle);

  }


  const { univerAPI, univer } = createUniver({
    locale: LocaleType.ZH_CN,
    locales: {
      [LocaleType.ZH_CN]: merge(
        {},
        sheetsCoreZhCn,
        sheetsThreadCommentZhCn,
        sheetsConditionalFormattingZhCn,
        sheetsDataValidationZhCn,
        sheetsDrawingZhCn,
        sheetsFilterZhCn,
        sheetsFindReplaceZhCn,
        sheetsHyperLinkZhCn,
        sheetsSortZhCn,
        sheetsNoteZhCn,
        sheetsTableZhCn,
        // sheetsZenEditorZhCn,
        // sheetsCrosshairHighlightZhCn,
      ),
    },
    // collaboration,
    logLevel: LogLevel.VERBOSE,
    theme: defaultTheme,
    override: [[IAuthzIoService, null]],
    presets: [
      /**
       * 核心预设
       */
      UniverSheetsCorePreset({
        container: shadowEle || container,
        header: true,
      }),
      /**
       * 绘图功能
       * + 插入形状、图片
       * + 基础绘图工具
       */
      UniverSheetsDrawingPreset({
        // collaboration,
      }),
      /**
       * 条件格式化
       */
      UniverSheetsConditionalFormattingPreset(),
      /**
       * 数据验证
       */
      UniverSheetsDataValidationPreset(),
      /**
       * 数据筛选
       */
      UniverSheetsFilterPreset(),
      /**
       * 查找替换
       */
      UniverSheetsFindReplacePreset(),
      UniverSheetsSortPreset(),
      UniverSheetsNotePreset(),
      UniverSheetsTablePreset(),
      UniverSheetsHyperLinkPreset(),
    ],
    plugins: [
      MyAuthzPlugin
    ],
  })

  // 设置当前用户
  if (owner) {
    const userManager = univerAPI.getUserManager();
    const currentUser = userManager._userManagerService.getCurrentUser()
    const currentUserIsValid = currentUser && currentUser.userID
    if (!currentUserIsValid) {
      console.log('lhh-log:initDefaultUser');
      userManager._userManagerService.setCurrentUser(owner)
    }
  }

  return { univerAPI, univer }
}

export function initUserList(users: User[]) {
  DataStore.set('userList', users)
}

export function initSheet() {
  const {univer, univerAPI} = setupSheet({
    container: document.getElementById('univer') as HTMLElement,
    owner: {
      userID: '40727',
      name: 'lhh'
    }
  })
  
  univerAPI.createWorkbook({})
  window.univerInstance = univer
  window.univerAPIInstance = univerAPI

}
