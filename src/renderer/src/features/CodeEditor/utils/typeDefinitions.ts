import HtmlDts from '../../../../../../node_modules/@react-email/html/dist/index.d.ts?raw'
import HeadDts from '../../../../../../node_modules/@react-email/head/dist/index.d.ts?raw'
import PreviewDts from '../../../../../../node_modules/@react-email/preview/dist/index.d.ts?raw'
import BodyDts from '../../../../../../node_modules/@react-email/body/dist/index.d.ts?raw'
import ContainerDts from '../../../../../../node_modules/@react-email/container/dist/index.d.ts?raw'
import SectionDts from '../../../../../../node_modules/@react-email/section/dist/index.d.ts?raw'
import ColumnDts from '../../../../../../node_modules/@react-email/column/dist/index.d.ts?raw'
import TextDts from '../../../../../../node_modules/@react-email/text/dist/index.d.ts?raw'
import ButtonDts from '../../../../../../node_modules/@react-email/button/dist/index.d.ts?raw'
import CodeBlockDts from '../../../../../../node_modules/@react-email/code-block/dist/index.d.ts?raw'
import CodeInlineDts from '../../../../../../node_modules/@react-email/code-inline/dist/index.d.ts?raw'
import FontDts from '../../../../../../node_modules/@react-email/font/dist/index.d.ts?raw'
import HeadingDts from '../../../../../../node_modules/@react-email/heading/dist/index.d.ts?raw'
import HrDts from '../../../../../../node_modules/@react-email/hr/dist/index.d.ts?raw'
import ImgDts from '../../../../../../node_modules/@react-email/img/dist/index.d.ts?raw'
import LinkDts from '../../../../../../node_modules/@react-email/link/dist/index.d.ts?raw'
import MarkdownDts from '../../../../../../node_modules/@react-email/markdown/dist/index.d.ts?raw'
import RowDts from '../../../../../../node_modules/@react-email/row/dist/index.d.ts?raw'
import ComponentsDts from '..//../../../../../node_modules/@react-email/components/dist/index.d.ts?raw'
import MockDts from './reactEmaildec.d.ts?raw'
import { createDataDefinition } from './dataDefinition'
import { ProjectRootType } from '@shared/projectTypes'

// React-email module had to be declared seperately in MockDts. For react-pdf we can import everything.

export async function loadTypeDefinitions(
  monaco: typeof import('monaco-editor'),
  project: ProjectRootType
) {
  const reactTypeDefs = import.meta.glob('../../../../../../node_modules/@types/react/**/*.d.ts', {
    query: '?raw',
    import: 'default',
    eager: true
  })

  const reactPdfTypeDefs = import.meta.glob('../../../../../../node_modules/@react-pdf/**/*.d.ts', {
    query: '?raw',
    import: 'default',
    eager: true
  })

  const dataDts = createDataDefinition(project)

  const dtsModules = { ...reactTypeDefs, ...reactPdfTypeDefs }

  // React-email module had to be declared seperately in MockDts. For react-pdf we can import everything.

  for (const path in dtsModules) {
    const dtsContent = dtsModules[path] as string
    const uri = path.replace('../../../../../../node_modules/', 'file:///node_modules/')
    monaco.languages.typescript.typescriptDefaults.addExtraLib(dtsContent, uri)
  }
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    dataDts,
    'file:///node_modules/@types/global.d.ts'
  )
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    HtmlDts,
    'file:///node_modules/@react-email/html/index.d.ts'
  )
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    HeadDts,
    'file:///node_modules/@react-email/head/index.d.ts'
  )
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    PreviewDts,
    'file:///node_modules/@react-email/preview/index.d.ts'
  )
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    BodyDts,
    'file:///node_modules/@react-email/body/index.d.ts'
  )
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    ContainerDts,
    'file:///node_modules/@react-email/container/index.d.ts'
  )
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    SectionDts,
    'file:///node_modules/@react-email/section/index.d.ts'
  )
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    ColumnDts,
    'file:///node_modules/@react-email/column/index.d.ts'
  )
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    TextDts,
    'file:///node_modules/@react-email/text/index.d.ts'
  )
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    ButtonDts,
    'file:///node_modules/@react-email/button/index.d.ts'
  )
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    CodeBlockDts,
    'file:///node_modules/@react-email/code-block/index.d.ts'
  )
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    CodeInlineDts,
    'file:///node_modules/@react-email/code-inline/index.d.ts'
  )
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    FontDts,
    'file:///node_modules/@react-email/font/index.d.ts'
  )
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    HeadingDts,
    'file:///node_modules/@react-email/heading/index.d.ts'
  )
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    HrDts,
    'file:///node_modules/@react-email/hr/index.d.ts'
  )
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    ImgDts,
    'file:///node_modules/@react-email/img/index.d.ts'
  )
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    LinkDts,
    'file:///node_modules/@react-email/link/index.d.ts'
  )
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    MarkdownDts,
    'file:///node_modules/@react-email/markdown/index.d.ts'
  )
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    RowDts,
    'file:///node_modules/@react-email/row/index.d.ts'
  )
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    ComponentsDts,
    'file://node_modules/@react-email/components/dist/index.d.ts'
  )
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    MockDts,
    'file://node_modules/@react-email/components/index.d.ts'
  )
}
